import { Module } from '@nestjs/common'
import AddBankAccountUseCase from './application/generate-auth-url.use-case'
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter'
import { BankingController } from './infrastructure/banking.controller'
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface'
import { TokensModule } from 'src/tokens/tokens.module'
import StartSessionUseCase from './application/start-session.use-case'

@Module({
  controllers: [BankingController],
  imports: [TokensModule],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    AddBankAccountUseCase,
    StartSessionUseCase,
  ],
})
export class BankingModule {}
