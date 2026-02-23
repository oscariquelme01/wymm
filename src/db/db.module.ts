import { Module } from '@nestjs/common'
import { TRANSACTION_MANAGER } from './domain/transaction-manager.interface'
import { TypeOrmTransactionManager } from './infrastructure/typeorm-transaction-manager'

@Module({
  providers: [
    {
      provide: TRANSACTION_MANAGER,
      useClass: TypeOrmTransactionManager,
    },
  ],
  exports: [TRANSACTION_MANAGER],
})
export class DbModule {}
