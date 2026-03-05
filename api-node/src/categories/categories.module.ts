import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMCategoriesRepository } from './infrastructure/typeorm-categories.repository'
import CategoriesSchema from './infrastructure/typeorm-categories.schema'

import { CATEGORIES_REPOSITORY } from './domain/categories.repository.interface'
import { CategoriesController } from './infrastructure/categories.controller'
import { CategoriesCrudService } from './application/categories.crud-service'
import { CATEGORIES_QUEUE } from './domain/category.entity'
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { CategoriesClassificationListener } from './infrastructure/categories-classification.listener'
import { TransactionsModule } from 'src/transactions/transactions.module'

@Module({
  controllers: [CategoriesController],
  imports: [
    TypeOrmModule.forFeature([CategoriesSchema]),
    BullModule.registerQueue({
      name: CATEGORIES_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: CATEGORIES_QUEUE,
      adapter: BullMQAdapter,
    }),
    TransactionsModule,
  ],
  providers: [
    {
      provide: CATEGORIES_REPOSITORY,
      useClass: TypeORMCategoriesRepository,
    },
    CategoriesCrudService,
    CategoriesClassificationListener,
  ],
  exports: [CATEGORIES_REPOSITORY, BullModule],
})
export class CategoriesModule {}
