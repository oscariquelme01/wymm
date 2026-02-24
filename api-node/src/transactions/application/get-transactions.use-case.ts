import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
  type OptionalQueryParams,
} from '../domain/transactions.repository.interface'

@Injectable()
export class GetTransactionsUseCase {
  private readonly logger = new Logger(GetTransactionsUseCase.name)

  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute(params: OptionalQueryParams) {
    this.logger.debug(`Retrieving transactions with params ${JSON.stringify(params)}`)
    const transactions = await this.transactionsRepository.findAll(params)
    this.logger.debug(`Retrieved ${transactions.length} transactions`)
    
    return transactions
  }
}
