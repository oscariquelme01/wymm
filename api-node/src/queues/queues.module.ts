import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { CATEGORIES_QUEUE, FETCH_TRANSACTIONS_QUEUE } from './domain/queues.consants'

@Module({
  imports: [
    BullModule.registerQueue({
      name: CATEGORIES_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: CATEGORIES_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: FETCH_TRANSACTIONS_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: FETCH_TRANSACTIONS_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
