import { Inject, Injectable } from '@nestjs/common'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'

@Injectable()
export default class GetCashflowUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute(startDate?: Date, endDate?: Date) {
    const income = await this.transactionsRepository.calculateTotal({
      startDate,
      endDate,
      type: 'INCOME',
    })
    const expenses = await this.transactionsRepository.calculateTotal({
      startDate,
      endDate,
      type: 'EXPENSE',
    })

    return income - expenses
  }
}
