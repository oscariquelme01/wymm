import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Account } from './account.entity'

export const ACCOUNTS_REPOSITORY = 'ACCOUNTS_REPOSITORY'
export interface AccountsRepository extends BaseRepository<Account> {}
