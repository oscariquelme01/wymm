import { Injectable, Inject } from '@nestjs/common'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
  type OptionalQueryParams,
} from '../domain/transactions.repository.interface'

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute(params: OptionalQueryParams) {
    return await this.transactionsRepository.findAll(params)
  }
}
