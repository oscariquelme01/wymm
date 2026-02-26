import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { TransactionCategorization } from '../domain/transaction-categorization.entity'
import { TransactionsCategorizationRepository } from '../domain/transactions-categorization.repository'

export class TypeORMTransactionCategorizationRepository
  extends TypeORMBaseRepository<TransactionCategorization>
  implements TransactionsCategorizationRepository
{
  protected module = APP_MODULES.TRANSACTIONS_CATEGORIZATION
}
