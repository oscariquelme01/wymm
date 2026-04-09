import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Transaction, TransactionTypes } from './transaction.entity'

export const TRANSACTIONS_REPOSITORY = 'TRANSACTIONS_REPOSITORY'

export type OptionalQueryParams = {
  startDate?: Date
  endDate?: Date
  type?: TransactionTypes
  accountId?: string
  minAmount?: number
  maxAmount?: number
  categoryId?: string
}

export interface TransactionsRepository extends BaseRepository<Transaction> {
  findAll(optionalParams: OptionalQueryParams): Promise<Transaction[]>
  calculateTotal(optionalParams: OptionalQueryParams): Promise<number>

  getTimeseries(
    interval: 'day' | 'week' | 'month',
    optionalParams: OptionalQueryParams
  ): Promise<{ date: Date; amount: number }[]>

  findTransferCandidates(
    transaction: Transaction,
    counterpartAccountId?: string
  ): Promise<Transaction[]>

  linkTransfer(
    transactionIds: string[],
    transferGroupId: string
  ): Promise<void>
}
