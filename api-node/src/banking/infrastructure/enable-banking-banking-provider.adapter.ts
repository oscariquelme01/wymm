import { createPrivateKey, KeyObject } from 'crypto'
import {
  AccountData,
  BalanceData,
  BankData,
  IBankingProvider,
  SessionData,
  TransactionData,
} from '../domain/IBanking-provider.interface'
import { SignJWT } from 'jose'
import { env } from 'src/config/env'
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import {
  ExternalServiceException,
  InternalStateException,
} from 'src/common/exceptions/domain-exceptions'

import * as EnableBankingTypes from './enable-banking.types'

const MAX_TTL_SECONDS = 60 * 60 * 24
let cachedKey: KeyObject | null = null

function getPrivateKey(): KeyObject {
  if (!cachedKey) {
    cachedKey = createPrivateKey(env.enableBanking.privateKeyPem)
  }
  return cachedKey
}

export const enableBankingConfig = {
  baseUrl: env.enableBanking.baseUrl,
}

@Injectable()
export class EnableBankingBankingProviderAdapter implements IBankingProvider {
  async listAvailableBanks() {
    const availablebanks: Array<BankData> = []
    const response = await this.makeRequest<EnableBankingTypes.AspspsResponse>(
      '/aspsps',
      'GET'
    )

    if (EnableBankingTypes.isErrorResponse(response)) {
      throw new ExternalServiceException(
        'Enable Banking',
        this.formatEnableBankingErrorResponse(response),
        response
      )
    }

    for (const aspsp of response.aspsps) {
      availablebanks.push({
        name: aspsp.name,
        country: aspsp.country,
        accountTypes: aspsp.psu_types,
        maximumConsentValidity: aspsp.maximum_consent_validity,
      })
    }

    return availablebanks
  }

  async startBankAuth(name: string, country: string): Promise<string> {
    const availableBanks = await this.listAvailableBanks()
    const filteredBanks = availableBanks.filter(
      (bank) => bank.name === name && bank.country === country
    )
    if (!filteredBanks.length) {
      throw new NotFoundException(
        `Bank ${name} from country ${country} not found`
      )
    }
    if (filteredBanks.length !== 1) {
      throw new BadRequestException(
        `Bank ${name} from country ${country} returned more than one result. Ambiguous request, can't tell which one to pick`
      )
    }

    const bank = filteredBanks[0]
    const now = new Date()

    const body = {
      aspsp: {
        name: name,
        country: country,
      },
      psu_types: bank,
      access: {
        balances: true,
        transactions: true,
        valid_until: new Date(
          now.getTime() + bank.maximumConsentValidity * 1000
        ).toISOString(),
      },
      state: crypto.randomUUID(),
      redirect_url: env.enableBanking.redirectURL,
    }

    const response = await this.makeRequest<{
      url: string
      authorization_id: string
      psu_id_hash: string
      state?: string
    }>('/auth', 'POST', body)

    if (EnableBankingTypes.isErrorResponse(response)) {
      throw new ExternalServiceException(
        'Enable Banking',
        this.formatEnableBankingErrorResponse(response),
        response
      )
    }

    return response.url
  }

  async authorizeSession(code: string): Promise<SessionData> {
    const body = {
      code,
    }

    const response =
      await this.makeRequest<EnableBankingTypes.AuthorizeSessionResponse>(
        '/sessions',
        'POST',
        body
      )

    if (EnableBankingTypes.isErrorResponse(response)) {
      throw new ExternalServiceException(
        'Enable Banking',
        this.formatEnableBankingErrorResponse(response),
        response
      )
    }

    const accountsData: AccountData[] = []
    for (const account of response.accounts) {
      accountsData.push({
        id: account.uid,
        name: account.name,
        currency: account.currency,
        iban: account.account_id?.iban || 'undefined', // necessary guardrails cause not all banks send those
        institution: account.account_servicer?.name || 'undefined',
      })
    }

    return {
      validUntil: new Date(response.access.valid_until),
      sessionId: response.session_id,
      accountsData: accountsData,
    }
  }

  async getSessionData(sessionId: string) {
    const response =
      await this.makeRequest<EnableBankingTypes.SessionDataResponse>(
        `/sessions/${sessionId}`,
        'GET'
      )

      if (EnableBankingTypes.isErrorResponse(response)) {
        throw new ExternalServiceException(
          'Enable Banking',
          this.formatEnableBankingErrorResponse(response),
          response
        )
      }

    const accountsData: AccountData[] = []
    for (const account of response.accounts) {
      const accountData = await this.makeRequest<EnableBankingTypes.Account>(
        `/accounts/${account}/details`,
        'GET'
      )

      if (EnableBankingTypes.isErrorResponse(accountData)) {
        throw new ExternalServiceException(
          'Enable Banking',
          this.formatEnableBankingErrorResponse(accountData),
          accountData
        )
      }

      accountsData.push({
        id: account,
        name: accountData.name,
        currency: accountData.currency,
        iban: accountData.account_id?.iban || 'undefined', // necessary guardrails cause not all banks send those
        institution: accountData.account_servicer?.name || 'undefined',
      })
    }

    return {
      validUntil: new Date(response.access.valid_until),
      sessionId: sessionId,
      accountsData: accountsData,
    }
  }

  async getLatestTransactions(accountId: string): Promise<TransactionData[]> {
    let allTransactions: TransactionData[] = []
    let continuationKey: string | undefined = undefined

    do {
      const queryParams = continuationKey
        ? `?continuation_key=${continuationKey}`
        : ''
      const path: string = `/accounts/${accountId}/transactions${queryParams}`
      const response =
        await this.makeRequest<EnableBankingTypes.TransactionsResponse>(
          path,
          'GET'
        )

      if (EnableBankingTypes.isErrorResponse(response)) {
        throw new ExternalServiceException(
          'Enable Banking',
          this.formatEnableBankingErrorResponse(response),
          response
        )
      }

      const mappedTransactions: TransactionData[] = response.transactions
        .filter((t) => t.status !== 'PDNG')
        .map((t) => ({
          amount: parseFloat(t.transaction_amount.amount),
          currency: t.transaction_amount.currency,
          date: new Date(t.booking_date || t.transaction_date || Date.now()),
          type: t.credit_debit_indicator === 'CRDT' ? 'INCOME' : 'EXPENSE',
          description:
            t.remittance_information?.join(' ') || t.note || 'No description',
          externalId: t.transaction_id ?? t.entry_reference,
          creditorName: t.creditor?.name,
          debtorName: t.debtor?.name,
        }))

      allTransactions = [...allTransactions, ...mappedTransactions]
      continuationKey = response.continuation_key
    } while (continuationKey)

    return allTransactions
  }

  async getBalance(account: string): Promise<BalanceData> {
    const response =
      await this.makeRequest<EnableBankingTypes.BalancesResponse>(
        `/accounts/${account}/balances`,
        'GET'
      )

    if (EnableBankingTypes.isErrorResponse(response)) {
      // TODO: Should I handle retries here??
      throw new ExternalServiceException(
        'Enable Banking',
        this.formatEnableBankingErrorResponse(response),
        response
      )
    }

    // CLBD = ClosingBooked
    const balances = response.balances
      .filter((balance) => balance.balance_type === 'CLBD')
      .map((balance) => ({
        amount: parseFloat(balance.balance_amount.amount),
        currency: balance.balance_amount.currency,
        asOf: balance.reference_date
          ? new Date(balance.reference_date)
          : undefined,
      }))

    if (!balances.length) {
      throw new InternalStateException(
        'Failed to get the closing booked balance'
      )
    }

    return balances[0]
  }

  private async makeRequest<T>(
    path: string,
    method: string,
    body: object = {}
  ): Promise<T | EnableBankingTypes.ErrorResponse> {
    const token = await this.generateEnableBankingJwt()
    const url = `${enableBankingConfig.baseUrl}${path}`

    const response = await fetch(url, {
      method: method ?? 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body && Object.keys(body).length ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      return (await response.json()) as EnableBankingTypes.ErrorResponse
    }

    return (await response.json()) as T
  }

  private async generateEnableBankingJwt(ttlSeconds = 300): Promise<string> {
    if (ttlSeconds <= 0 || ttlSeconds > MAX_TTL_SECONDS) {
      throw new BadRequestException(
        `ttl Seconds must be between 1 and ${MAX_TTL_SECONDS}`
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const key = getPrivateKey()

    return new SignJWT({})
      .setProtectedHeader({
        typ: 'JWT',
        alg: 'RS256',
        kid: env.enableBanking.appId,
      })
      .setIssuer('enablebanking.com')
      .setAudience(env.enableBanking.audience)
      .setIssuedAt(now)
      .setExpirationTime(now + ttlSeconds)
      .sign(key)
  }

  formatEnableBankingErrorResponse(response: EnableBankingTypes.ErrorResponse) {
    const hasDetail = response.detail && response.detail.length
    const detail = hasDetail ? `: ${response.detail}` : ''
    return `Enable banking request failed: HTTP ${response.code}: ${response.error} -- ${response.message}${detail}`
  }
}
