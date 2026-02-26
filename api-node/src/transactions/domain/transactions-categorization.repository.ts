import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { TransactionCategorization } from './transaction-categorization.entity'

export const TRANSACTIONS_CATEGORIZATION_REPOSITORY = 'TRANSACTIONS_CATEGORIZATION_REPOSITORY'

export interface TransactionsCategorizationRepository extends BaseRepository<TransactionCategorization> {}
