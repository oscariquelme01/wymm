import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Account } from '../domain/account.entity'
import { AccountsRepository } from '../domain/accounts.repository.interface'

export class TypeORMAccountsRepository
  extends TypeORMBaseRepository<Account>
  implements AccountsRepository
{
  protected module = APP_MODULES.ACCOUNTS
}
