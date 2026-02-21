import BaseModel from "src/db/domain/base.entity"

export enum AccountTypes {
  WANTS = 'wants',
  NEEDS = 'needs',
  INVESTMENTS = 'investments'
}

export interface Account extends BaseModel {
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
