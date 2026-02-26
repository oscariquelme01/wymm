import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMCategoriesRepository } from './infrastructure/typeorm-categories.repository'
import CategoriesSchema from './infrastructure/typeorm-categories.schema'

import { CATEGORIES_REPOSITORY } from './domain/categories.repository.interface'
import { CategoriesController } from './infrastructure/categories.controller'
import { CategoriesCrudService } from './application/categories.crud-service'

@Module({
  controllers: [CategoriesController],
  imports: [
    TypeOrmModule.forFeature([CategoriesSchema]),
  ],
  providers: [
    {
      provide: CATEGORIES_REPOSITORY,
      useClass: TypeORMCategoriesRepository,
    },
    CategoriesCrudService
  ],
  exports: [CATEGORIES_REPOSITORY],
})
export class CategoriesModule {}
