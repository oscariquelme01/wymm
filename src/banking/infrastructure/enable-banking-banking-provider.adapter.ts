import { createPrivateKey, KeyObject } from 'crypto'
import {
  BankData,
  AddBankAccountDTO,
  IBankingProvider,
  SessionData,
} from '../domain/IBanking-provider.interface'
import { SignJWT } from 'jose'
import { env } from 'src/config/env'
import { Injectable } from '@nestjs/common'

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

  async generateAuthUrl(name: string, country: string): Promise<string> {
    const availableBanks = await this.listAvailableBanks()
    const filteredBanks = availableBanks.filter(
      (bank) => bank.name === name && bank.country === country
    )
    if (!filteredBanks.length) {
      throw new Error(`Bank ${name} from country ${country} not found!`)
    }
    if (filteredBanks.length !== 1) {
      throw new Error(
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
        valid_until: new Date(now.getTime() + bank.maximumConsentValidity),
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

    return response.url
  }

  async startSession(code: string): Promise<SessionData> {
    const body = {
      code,
    }

    const response =
      await this.makeRequest<EnableBankingTypes.AuthorizeSessionResponse>(
        '/sessions',
        'POST',
        body
      )

    return {
      validUntil: new Date(response.access.valid_until),
      sessionId: response.session_id,
    }
  }

  private async makeRequest<T>(
    path: string,
    method: string,
    body: object = {}
  ): Promise<T> {
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
      const text = await response.text()
      throw new Error(
        `Enable Banking request failed: ${response.status} ${response.statusText} - ${text}`
      )
    }

    return (await response.json()) as T
  }

  private async generateEnableBankingJwt(ttlSeconds = 300): Promise<string> {
    if (ttlSeconds <= 0 || ttlSeconds > MAX_TTL_SECONDS) {
      throw new Error(`ttl Seconds must be between 1 and ${MAX_TTL_SECONDS}`)
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
}
