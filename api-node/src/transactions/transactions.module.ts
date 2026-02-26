import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMTransactionsRepository } from './infrastructure/typeorm-transactions.repository'
import TransactionsSchema from './infrastructure/typeorm-transactions.schema'
import { TRANSACTIONS_REPOSITORY } from './domain/transactions.repository.interface'
import { TRANSACTIONS_CATEGORIZATION_REPOSITORY } from './domain/transactions-categorization.repository'
import { TransactionsController } from './infrastructure/transactions.controller'
import { GetTransactionsUseCase } from './application/get-transactions.use-case'
import { TypeORMTransactionCategorizationRepository } from './infrastructure/typeorm-transactions-categorization.repository'
import TransactionsCategorizationSchema from './infrastructure/typeorm-transactions-categorization.schema'

@Module({
  imports: [TypeOrmModule.forFeature([TransactionsSchema, TransactionsCategorizationSchema])],
  controllers: [TransactionsController],
  providers: [
    GetTransactionsUseCase,
    {
      provide: TRANSACTIONS_REPOSITORY,
      useClass: TypeORMTransactionsRepository,
    },
    {
      provide: TRANSACTIONS_CATEGORIZATION_REPOSITORY,
      useClass: TypeORMTransactionCategorizationRepository,
    },
  ],
  exports: [TRANSACTIONS_REPOSITORY],
})
export class TransactionsModule {}
