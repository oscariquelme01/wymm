import { Inject, Injectable } from '@nestjs/common'
import { TransactionTypes } from 'src/transactions/domain/transaction.entity'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'

@Injectable()
export default class GetAggregateUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute(startDate?: Date, endDate?: Date, type?: TransactionTypes) {
    return this.transactionsRepository.calculateTotal({
      startDate,
      endDate,
      type,
    })
  }
}
