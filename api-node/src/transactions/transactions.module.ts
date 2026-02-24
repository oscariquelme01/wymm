import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMTransactionsRepository } from './infrastructure/typeorm-transactions.repository'
import TransactionsSchema from './infrastructure/typeorm-transactions.schema'
import { TRANSACTIONS_REPOSITORY } from './domain/transactions.repository.interface'

@Module({
  imports: [TypeOrmModule.forFeature([TransactionsSchema])],
  providers: [
    {
      provide: TRANSACTIONS_REPOSITORY,
      useClass: TypeORMTransactionsRepository,
    },
  ],
  exports: [TRANSACTIONS_REPOSITORY],
})
export class TransactionsModule {}
