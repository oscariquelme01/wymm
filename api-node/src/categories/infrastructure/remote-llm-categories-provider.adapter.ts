import { Injectable, Logger } from '@nestjs/common'
import {
  CategorizedTransactionData,
  ICategoriesProvider,
  TransactionData,
} from '../domain/ICategories-provider.interface'
import { env } from 'src/config/env'

@Injectable()
export class RemoteLLMCategoriesProviderAdapter implements ICategoriesProvider {
  private readonly logger = new Logger(RemoteLLMCategoriesProviderAdapter.name)

  async categorizeTransaction(
    transaction: TransactionData
  ): Promise<CategorizedTransactionData> {
    try {
      this.logger.debug(`Categorizing transaction ${transaction.description}`)
      const url = env.classifier.url + '/classify'

      const data = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: [transaction] }),
      })

      const categorizedTransaction =
        (await data.json()) as CategorizedTransactionData[]

      return categorizedTransaction[0]
    } catch (e) {
      this.logger.error(
        `Failed to categorize transaction ${transaction.description}: ${e}`
      )
      throw e
    }
  }

  async categorizeBulkTransactions(
    transactions: TransactionData[]
  ): Promise<CategorizedTransactionData[]> {
    try {
      this.logger.debug(`Categorizing ${transactions.length} transactions`)
      const url = env.classifier.url + '/classify'

      const data = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: transactions }),
      })

      return (await data.json()) as CategorizedTransactionData[]
    } catch (e) {
      this.logger.error(`Failed to categorize transactions: ${e}`)
      throw e
    }
  }
}
