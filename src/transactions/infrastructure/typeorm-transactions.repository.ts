import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Transaction } from '../domain/transaction.entity'
import { TransactionsRepository } from '../domain/transactions.repository.interface'

export class TypeORMTransactionsRepository
  extends TypeORMBaseRepository<Transaction>
  implements TransactionsRepository
{
  protected module = APP_MODULES.TRANSACTIONS
}
