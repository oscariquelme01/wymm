import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";

import { BankingModule } from './banking/banking.module'
import { DATABASE_CONFIG } from './db/infrastructure/typeorm-config'
import { AccountsModule } from './accounts/accounts.module'
import { SessionsModule } from './sessions/sessions.module'
import { AuthModule } from './auth/auth.module'
import { TransactionsModule } from './transactions/transactions.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { CategoriesModule } from './categories/categories.module'
import { AlertsModule } from './alerts/alerts.module'
import { BullModule } from '@nestjs/bullmq'
import { env } from './config/env'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter
    }),
    TypeOrmModule.forRoot(DATABASE_CONFIG),
    ScheduleModule.forRoot(),
    AuthModule,
    BankingModule,
    AccountsModule,
    SessionsModule,
    TransactionsModule,
    AnalyticsModule,
    CategoriesModule,
    AlertsModule,
  ],
})
export class AppModule {}
