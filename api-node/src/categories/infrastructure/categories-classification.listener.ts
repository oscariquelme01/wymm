import { Inject, Logger } from '@nestjs/common'
import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq'
import { CATEGORIES_QUEUE } from 'src/queues/domain/queues.consants'
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../domain/categories.repository.interface'
import {
  TRANSACTIONS_CATEGORIZATION_REPOSITORY,
  type TransactionsCategorizationRepository,
} from 'src/transactions/domain/transactions-categorization.repository'
import { CategorizationSource } from 'src/transactions/domain/transaction-categorization.entity'

interface ClassificationResult {
  id: string
  category: string
  confidence: string
  reasoning: string
}

@QueueEventsListener(CATEGORIES_QUEUE)
export class CategoriesClassificationListener extends QueueEventsHost {
  private readonly logger = new Logger(CategoriesClassificationListener.name)

  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(TRANSACTIONS_CATEGORIZATION_REPOSITORY)
    private readonly categorizationRepository: TransactionsCategorizationRepository,
  ) {
    super()
  }

  @OnQueueEvent('completed')
  async onCompleted({
    jobId,
    returnvalue,
  }: {
    jobId: string
    returnvalue: string
    prev?: string
  }) {
    try {
      const result: ClassificationResult = typeof returnvalue === 'string'
        ? JSON.parse(returnvalue)
        : returnvalue

      if (!result.id || !result.category) {
        this.logger.warn(`Job ${jobId} completed but result is missing id or category: ${JSON.stringify(result)}`)
        return
      }

      this.logger.debug(`Job ${jobId} completed: transaction ${result.id} -> ${result.category} (${result.confidence})`)

      // Find or create the root category by name
      const category = await this.findOrCreateCategory(result.category)

      // Check if a categorization already exists for this transaction
      const existing = await this.categorizationRepository.findOneBy({
        transaction: { id: result.id },
      })

      if (existing) {
        // Only overwrite if the existing categorization is from ML (not user overrides)
        if (existing.source === CategorizationSource.USER_OVERRIDES) {
          this.logger.debug(`Skipping ML categorization for transaction ${result.id} — user override exists`)
          return
        }

        await this.categorizationRepository.update(
          { id: existing.id },
          {
            category: { id: category.id },
            confidence: result.confidence,
            reasoning: result.reasoning,
            source: CategorizationSource.ML_MODEL,
          },
        )
      } else {
        await this.categorizationRepository.save({
          transaction: { id: result.id },
          category: { id: category.id },
          confidence: result.confidence,
          reasoning: result.reasoning,
          source: CategorizationSource.ML_MODEL,
        })
      }

      this.logger.log(`Categorized transaction ${result.id} as "${result.category}" (${result.confidence})`)
    } catch (error) {
      this.logger.error(`Failed to process completed job ${jobId}: ${error}`)
    }
  }

  private async findOrCreateCategory(name: string) {
    const existing = await this.categoriesRepository.findOneBy({ name, parentId: null })
    if (existing) return existing

    this.logger.log(`Creating new root category: "${name}"`)
    return await this.categoriesRepository.save({ name, parentId: null })
  }
}
