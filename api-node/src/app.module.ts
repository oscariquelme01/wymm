import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'

import { BankingModule } from './banking/banking.module'
import { DATABASE_CONFIG } from './db/infrastructure/typeorm-config'
import { TokensModule } from './tokens/tokens.module'
import { AccountsModule } from './accounts/accounts.module'
import { SessionsModule } from './sessions/sessions.module'
import { AuthModule } from './auth/auth.module'
import { TransactionsModule } from './transactions/transactions.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { CategoriesModule } from './categories/categories.module'
import { AlertsModule } from './alerts/alerts.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(DATABASE_CONFIG),
    ScheduleModule.forRoot(),
    AuthModule,
    BankingModule,
    TokensModule,
    AccountsModule,
    SessionsModule,
    TransactionsModule,
    AnalyticsModule,
    CategoriesModule,
    AlertsModule,
  ],
})
export class AppModule {}
