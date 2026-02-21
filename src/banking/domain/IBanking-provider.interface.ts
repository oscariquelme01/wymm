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
  name: string,
  currency: string,
  iban: string,
  institution: string
}

export interface SessionData {
  validUntil: Date
  sessionId: string
  accountsData: Array<AccountData>
}

export interface IBankingProvider {
  listAvailableBanks(): Promise<BankData[]>
  startBankAuth(name: string, country: string): Promise<string> // just returns the URL to auth
  authorizeSession(code: string): Promise<SessionData>
}

export const BANKING_PROVIDER = 'BANKING_PROVIDER'
