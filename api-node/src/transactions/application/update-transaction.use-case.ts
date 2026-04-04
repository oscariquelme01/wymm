import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from '../domain/transactions.repository.interface'
import { TransactionTypes } from '../domain/transaction.entity'
import {
  TRANSACTIONS_CATEGORIZATION_REPOSITORY,
  type TransactionsCategorizationRepository,
} from '../domain/transactions-categorization.repository'
import { CategorizationSource } from '../domain/transaction-categorization.entity'

@Injectable()
export class UpdateTransactionUseCase {
  private readonly logger = new Logger(UpdateTransactionUseCase.name)

  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(TRANSACTIONS_CATEGORIZATION_REPOSITORY)
    private readonly categorizationRepository: TransactionsCategorizationRepository
  ) {}

  async execute(
    id: string,
    updates: { description?: string; amount?: number; date?: string; type?: TransactionTypes; accountId?: string; categoryId?: string }
  ) {
    this.logger.debug(
      `Updating transaction ${id} with ${JSON.stringify(updates)}`
    )

    const transaction = await this.transactionsRepository.findOneBy({ id })
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`)
    }

    if (updates.categoryId)
      await this.categorizeTransaction(id, updates.categoryId)

    const { categoryId, accountId, ...directUpdates } = updates
    const updatePayload: Record<string, unknown> = { ...directUpdates }

    if (accountId) {
      updatePayload.account = { id: accountId }
    }

    await this.transactionsRepository.update({ id }, updatePayload)

    return { ...transaction, ...updates }
  }

  async categorizeTransaction(transactionId: string, categoryId: string) {
    // Check if a categorization already exists for this transaction
    const existing = await this.categorizationRepository.findOneBy({
      transaction: { id: transactionId },
    })

    if (existing) {
      await this.categorizationRepository.update(
        { id: existing.id },
        {
          category: { id: categoryId },
          source: CategorizationSource.USER_OVERRIDES,
          confidence: null,
        }
      )
      return {
        ...existing,
        category: { id: categoryId },
        source: CategorizationSource.USER_OVERRIDES,
      }
    }

    // if it doesn't exist, create a new one
    return await this.categorizationRepository.save({
      transaction: { id: transactionId },
      category: { id: categoryId },
      source: CategorizationSource.USER_OVERRIDES,
      confidence: null,
    })
  }
}
