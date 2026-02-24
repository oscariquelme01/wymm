import BaseModel from 'src/db/domain/base.entity'
import { Session } from 'src/sessions/domain/session.entity'

export enum AccountTypes {
  WANTS = 'wants',
  NEEDS = 'needs',
  INVESTMENTS = 'investments',
}

export interface Account extends BaseModel {
  name: string
  currency: string
  type: AccountTypes
  institution: string
  balance: number
  externalId: string
  iban: string
  session: Session
}
