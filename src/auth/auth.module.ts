import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { SessionsModule } from 'src/sessions/sessions.module'
import StartBankAuthUseCase from './application/start-bank-auth.use-case'
import AuthorizeBankUseCase from './application/authorize-bank.use-case'
import { BankingModule } from 'src/banking/banking.module'

@Module({
  imports: [AccountsModule, SessionsModule, BankingModule],
  providers: [
    StartBankAuthUseCase,
    AuthorizeBankUseCase,
  ],
})
export class AuthModule {}
