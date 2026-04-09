import { Inject, Injectable } from '@nestjs/common'
import { TransactionTypes } from 'src/transactions/domain/transaction.entity'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'

@Injectable()
export default class GetTimeseriesUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute(
    interval: 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date,
    type?: TransactionTypes,
    categoryId?: string
  ) {
    return this.transactionsRepository.getTimeseries(
      interval,
      {
        startDate,
        endDate,
        type,
        categoryId,
      }
    )
  }
}
