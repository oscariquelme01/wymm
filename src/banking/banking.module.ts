import { Module } from '@nestjs/common'
import StartBankAuthUseCase from './application/start-bank-auth.use-case'
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter'
import { BankingController } from './infrastructure/banking.controller'
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface'
import { TokensModule } from 'src/tokens/tokens.module'
import StartSessionUseCase from './application/authorize-bank.use-case'

@Module({
  controllers: [BankingController],
  imports: [TokensModule],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    StartBankAuthUseCase,
    StartSessionUseCase,
  ],
})
export class BankingModule {}
