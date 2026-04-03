import { TransactionData } from 'src/banking/domain/IBanking-provider.interface'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from '../domain/transactions.repository.interface'
import { Inject } from '@nestjs/common'
import { CATEGORIES_QUEUE } from 'src/queues/domain/queues.consants'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { Transaction } from '../domain/transaction.entity'

export default class StoreTransactionsUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @InjectQueue(CATEGORIES_QUEUE)
    private readonly categoriesQueue: Queue
  ) {}

  async execute(accountId: string, transactions: Array<TransactionData>): Promise<Transaction[]> {
    const newTransactions: Transaction[] = []

    for (const transaction of transactions) {
      const existingTransaction = await this.transactionsRepository.findOneBy({
        externalId: transaction.externalId,
        account: { id: accountId },
      })

      if (!existingTransaction) {
        const savedTransaction = await this.transactionsRepository.save({
          ...transaction,
          account: { id: accountId },
          transactionCategorization: undefined,
        })

        newTransactions.push(savedTransaction)

        await this.categoriesQueue.add(
          'categorize-transaction',
          {
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount,
            id: savedTransaction.id,
          },
          {
            delay: 1000 * 60, // add 1 healthy minute of delay before ml starts categorizing. This prevents some race conditions where the cron is not done yet (and thus the transactions are not commited) but the ml is already categorizing
          }
        )
      }
    }

    return newTransactions
  }
}
