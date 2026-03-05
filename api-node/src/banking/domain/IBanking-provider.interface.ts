import { TransactionTypes } from 'src/transactions/domain/transaction.entity'

export interface AddBankAccountDTO {
  institutionId: string
  country: string
}

export interface BankData {
  name: string
  country: string
  accountTypes: string[]
  maximumConsentValidity: number // amount in ms till next auth required
}

export interface AccountData {
  id: string
  name: string
  currency: string
  iban: string
  institution: string
}

export interface SessionData {
  validUntil: Date
  sessionId: string
  accountsData: Array<AccountData>
}

export interface TransactionData {
  amount: number
  currency: string
  date: Date
  description: string
  externalId: string
  creditorName?: string
  debtorName?: string
  type: TransactionTypes
}

export interface BalanceData {
  amount: number
  currency: string
  asOf?: Date
}

export interface IBankingProvider {
  listAvailableBanks(): Promise<BankData[]>
  startBankAuth(name: string, country: string): Promise<string>
  authorizeSession(code: string): Promise<SessionData>
  getSessionData(sessionId: string): Promise<SessionData>
  getLatestTransactions(accountId: string): Promise<TransactionData[]>
  getBalance(accountId: string): Promise<BalanceData>
}

export const BANKING_PROVIDER = 'BANKING_PROVIDER'
