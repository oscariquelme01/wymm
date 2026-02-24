import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Transaction, TransactionTypes } from './transaction.entity'

export const TRANSACTIONS_REPOSITORY = 'TRANSACTIONS_REPOSITORY'

export type OptionalQueryParams = {
  startDate?: Date,
  endDate?: Date
  type?: TransactionTypes
}

export interface TransactionsRepository extends BaseRepository<Transaction> {
  calculateTotal(optionalParams: OptionalQueryParams): Promise<number>

  getTimeseries(
    interval: 'day' | 'week' | 'month',
    optionalParams: OptionalQueryParams
  ): Promise<{ date: Date; amount: number }[]>
}
