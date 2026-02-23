import { Account } from 'src/accounts/domain/account.entity'
import BaseModel from 'src/db/domain/base.entity'

export type TransactionTypes = 'EXPENSE' | 'INCOME' | 'TRANSFER'

export interface Transaction extends BaseModel {
  amount: number
  currency: string
  date: Date
  type: TransactionTypes
  description: string
  externalId: string
  creditorName?: string
  debtorName?: string
  account: Account
  // trasnferGroupId: string // TODO: implement transfers
  // categoryId: string // TODO: relation between categories
}
