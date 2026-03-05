import { InjectQueue, Processor } from '@nestjs/bullmq'
import { Inject } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from 'src/banking/domain/IBanking-provider.interface'
import { FETCH_TRANSACTIONS_QUEUE } from 'src/queues/domain/queues.consants'
import StoreTransactionsUseCase from '../application/store-transactions.use-case'
import { randomInt } from 'node:crypto'

@Processor(FETCH_TRANSACTIONS_QUEUE)
export class FetchTransactionsProcessor {
  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    private readonly storeTransactionsUseCase: StoreTransactionsUseCase,
    @InjectQueue(FETCH_TRANSACTIONS_QUEUE)
    private readonly transactionsQueue: Queue
  ) {}

  // Job<job-data-type, return-data-type, job-name-type>
  async process(
    job: Job<
      {
        accountId: string
        continuationKey: string
        dateFrom?: Date
        dateTo?: Date
      },
      { ok: boolean },
      string
    >
  ): Promise<any> {
    try {
      const { accountId, dateFrom, dateTo, continuationKey } = job.data

      const response = await this.bankingProvider.getTransactions(
        accountId,
        dateFrom,
        dateTo,
        continuationKey
      )

      await this.storeTransactionsUseCase.execute(
        accountId,
        response.transactionData
      )

      // if we are still not done, we gotta keep retrying!
      if (!response.isDone) {
        this.transactionsQueue.add(
          'fetch-transaction',
          {
            accountId,
            dateFrom,
            dateTo,
            continuationKey,
          },
          {
            // add some jitter cause people say that's a good idea
            delay: 1000 * (3600 + randomInt(0, 300)),
          }
        )
      }

      return { ok: true }
    } catch (e) {}
  }
}
