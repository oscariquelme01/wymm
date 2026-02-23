import { Module } from '@nestjs/common'
import StartBankAuthUseCase from './application/start-bank-auth.use-case'
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter'
import { BankingController } from './infrastructure/banking.controller'
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface'
import { TokensModule } from 'src/tokens/tokens.module'
import StartSessionUseCase from './application/authorize-bank.use-case'
import { AccountsModule } from 'src/accounts/accounts.module'
import { SessionsModule } from 'src/sessions/sessions.module'
import ListBanksUseCase from './application/list-banks.use-case'

@Module({
  controllers: [BankingController],
  imports: [TokensModule, AccountsModule, SessionsModule],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    StartBankAuthUseCase,
    StartSessionUseCase,
    ListBanksUseCase
  ],
})
export class BankingModule {}
