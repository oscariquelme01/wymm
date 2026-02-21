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

export interface SessionData {
  validUntil: Date
  sessionId: string
}

export interface IBankingProvider {
  listAvailableBanks(): Promise<BankData[]>
  generateAuthUrl(name: string, country: string): Promise<string> // just returns the URL to auth
  startSession(code: string): Promise<SessionData>
}

export const BANKING_PROVIDER = 'BANKING_PROVIDER'
