import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Transaction } from './transaction.entity'

export const TRANSACTIONS_REPOSITORY = 'TRANSACTIONS_REPOSITORY'
export interface TransactionsRepository extends BaseRepository<Transaction> {}
