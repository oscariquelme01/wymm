import { Module } from '@nestjs/common'
import { AnalyticsController } from './infrastructure/analytics.controller'
import GetAggregateUseCase from './application/get-aggregate.use-case'
import GetTimeseriesUseCase from './application/get-timeseries.use-case'
import GetCashflowUseCase from './application/get-cashflow.use-case'
import { TransactionsModule } from 'src/transactions/transactions.module'

@Module({
  imports: [TransactionsModule],
  controllers: [AnalyticsController],
  providers: [GetAggregateUseCase, GetTimeseriesUseCase, GetCashflowUseCase],
})
export class AnalyticsModule {}
