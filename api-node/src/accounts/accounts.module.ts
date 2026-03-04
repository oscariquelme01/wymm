import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMAccountsRepository } from './infrastructure/typeorm-accounts.repository'
import AccountsSchema from './infrastructure/typeorm-accounts.schema'

import { ACCOUNTS_REPOSITORY } from './domain/accounts.repository.interface'
import SyncAccountsUseCase from './application/sync-accounts.use-case'
import { BankingModule } from 'src/banking/banking.module'
import { AccountsController } from './infrastructure/accounts.controller'
import { TransactionsModule } from 'src/transactions/transactions.module'
import { DbModule } from 'src/db/db.module'
import { SyncAccountsCron } from './infrastructure/sync-accounts.cron'

import { GetAccountsUseCase } from './application/get-accounts.use-case'
import { CategoriesModule } from 'src/categories/categories.module'
import { AlertsModule } from 'src/alerts/alerts.module'

@Module({
  controllers: [AccountsController],
  imports: [
    TypeOrmModule.forFeature([AccountsSchema]),
    BankingModule,
    TransactionsModule,
    DbModule,
    CategoriesModule,
    forwardRef(() => AlertsModule),
  ],
  providers: [
    SyncAccountsUseCase,
    GetAccountsUseCase,
    SyncAccountsCron,
    {
      provide: ACCOUNTS_REPOSITORY,
      useClass: TypeORMAccountsRepository,
    },
  ],
  exports: [ACCOUNTS_REPOSITORY],
})
export class AccountsModule {}
