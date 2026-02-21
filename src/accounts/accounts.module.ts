import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMAccountsRepository } from './infrastructure/typeorm-accounts.repository'
import AccountsSchema from './infrastructure/typeorm-accounts.schema'

import { ACCOUNTS_REPOSITORY } from './domain/accounts.repository.interface'

@Module({
  imports: [TypeOrmModule.forFeature([AccountsSchema])],
  providers: [
    {
      provide: ACCOUNTS_REPOSITORY,
      useClass: TypeORMAccountsRepository,
    },
  ],
  exports: [ACCOUNTS_REPOSITORY],
})
export class AccountsModule {}
