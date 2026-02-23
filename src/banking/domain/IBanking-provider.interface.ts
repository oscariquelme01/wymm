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

export type TransactionTypes = 'EXPENSE' | 'INCOME' | 'TRANSFER'

export interface Transaction {
  amount: number
  currency: string
  date: Date
  type: TransactionTypes
  description: string
  externalId: string
  creditorName?: string
  debtorName?: string
  // trasnferGroupId: string // TODO: implement transfers
  // categoryId: string // TODO: relation between categories
}

export interface IBankingProvider {
  listAvailableBanks(): Promise<BankData[]>
  startBankAuth(name: string, country: string): Promise<string>
  authorizeSession(code: string): Promise<SessionData>
  getSessionData(sessionId: string): Promise<SessionData>
  getTransactions(accountId: string): Promise<Transaction[]>
}

export const BANKING_PROVIDER = 'BANKING_PROVIDER'
