import { Module } from '@nestjs/common'
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter'
import { BankingController } from './infrastructure/banking.controller'
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface'
import { TokensModule } from 'src/tokens/tokens.module'
import { AccountsModule } from 'src/accounts/accounts.module'
import { SessionsModule } from 'src/sessions/sessions.module'
import ListBanksUseCase from './application/list-banks.use-case'
import GetSessionDataUseCase from './application/get-session-data.use-case'

@Module({
  controllers: [BankingController],
  imports: [TokensModule, AccountsModule, SessionsModule],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    ListBanksUseCase,
    GetSessionDataUseCase,
  ],
  exports: [
    BANKING_PROVIDER
  ]
})
export class BankingModule {}
