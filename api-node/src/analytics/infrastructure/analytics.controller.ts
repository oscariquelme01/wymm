import { Controller, Get, Query } from '@nestjs/common'
import GetAggregateUseCase from '../application/get-aggregate.use-case'
import GetTimeseriesUseCase from '../application/get-timeseries.use-case'
import GetCashflowUseCase from '../application/get-cashflow.use-case'
import type { TransactionTypes } from 'src/transactions/domain/transaction.entity'

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getAggregateUseCase: GetAggregateUseCase,
    private readonly getTimeseriesUseCase: GetTimeseriesUseCase,
    private readonly getCashflowUseCase: GetCashflowUseCase
  ) {}

  @Get('aggregate')
  async getAggregate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: TransactionTypes
  ) {
    return this.getAggregateUseCase.execute(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      type
    )
  }

  @Get('timeseries')
  async getTimeseries(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: 'day' | 'week' | 'month',
    @Query('type') type?: TransactionTypes
  ) {
    return this.getTimeseriesUseCase.execute(
      interval,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      type
    )
  }

  @Get('cashflow')
  async getCashflow(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.getCashflowUseCase.execute(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    )
  }
}
