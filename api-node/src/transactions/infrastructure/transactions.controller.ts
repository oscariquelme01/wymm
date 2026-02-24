import { Controller, Get, Query } from '@nestjs/common'
import { GetTransactionsUseCase } from '../application/get-transactions.use-case'
import { TransactionTypes } from '../domain/transaction.entity'

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase
  ) {}

  @Get()
  async getTransactions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('accountId') accountId?: string
  ) {
    return await this.getTransactionsUseCase.execute({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type: type as TransactionTypes,
      accountId,
    })
  }
}
