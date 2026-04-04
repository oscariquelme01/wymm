import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common'
import { GetTransactionsUseCase } from '../application/get-transactions.use-case'
import { UpdateTransactionUseCase } from '../application/update-transaction.use-case'
import { TransactionTypes } from '../domain/transaction.entity'

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
  ) {}

  @Get()
  async getTransactions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('accountId') accountId?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string
  ) {
    return await this.getTransactionsUseCase.execute({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type: type as TransactionTypes,
      accountId,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    })
  }

  @Patch(':id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() body: { description?: string; amount?: number; date?: string; type?: TransactionTypes; accountId?: string; categoryId?: string },
  ) {
    return await this.updateTransactionUseCase.execute(id, body)
  }
}
