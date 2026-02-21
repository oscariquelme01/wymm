export enum AccountTypes {
  WANTS = 'wants',
  NEEDS = 'needs',
  INVESTMENTS = 'investments'
}

export interface Account {
  name: AccountTypes
  currency: string,
  type: AccountTypes
  institution: string
  balance: number
  externalId: string
  iban: string
  expiresAt: Date
  value: string
}
