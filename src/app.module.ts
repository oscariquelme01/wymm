import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BankingModule } from './banking/banking.module'
import { DATABASE_CONFIG } from './db/infrastructure/typeorm-config'
import { TokensModule } from './tokens/tokens.module'
import { AccountsModule } from './accounts/accounts.module'
import { SessionsModule } from './sessions/sessions.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(DATABASE_CONFIG),
    BankingModule,
    TokensModule,
    AccountsModule,
    SessionsModule
  ],
})
export class AppModule {}
