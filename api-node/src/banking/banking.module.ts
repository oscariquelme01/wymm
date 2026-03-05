import { Module } from '@nestjs/common'
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter'
import { BankingController } from './infrastructure/banking.controller'
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface'
import ListBanksUseCase from './application/list-banks.use-case'
import GetSessionDataUseCase from './application/get-session-data.use-case'
import { QueuesModule } from 'src/queues/queues.module'

@Module({
  controllers: [BankingController],
  imports: [
    QueuesModule
  ],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    ListBanksUseCase,
    GetSessionDataUseCase,
  ],
  exports: [
    BANKING_PROVIDER,
  ]
})
export class BankingModule {}
