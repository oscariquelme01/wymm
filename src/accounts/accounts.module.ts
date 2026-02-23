import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMAccountsRepository } from './infrastructure/typeorm-accounts.repository'
import AccountsSchema from './infrastructure/typeorm-accounts.schema'

import { ACCOUNTS_REPOSITORY } from './domain/accounts.repository.interface'
import SyncAccountsUseCase from './application/sync-transactions.use-case'
import { BankingModule } from 'src/banking/banking.module'
import { AccountsController } from './infrastructure/accounts.controller'

@Module({
  controllers: [AccountsController],
  imports: [TypeOrmModule.forFeature([AccountsSchema]), BankingModule],
  providers: [
    SyncAccountsUseCase,
    {
      provide: ACCOUNTS_REPOSITORY,
      useClass: TypeORMAccountsRepository,
    },
  ],
  exports: [ACCOUNTS_REPOSITORY],
})
export class AccountsModule {}
