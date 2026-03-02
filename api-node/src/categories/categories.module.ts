import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMCategoriesRepository } from './infrastructure/typeorm-categories.repository'
import CategoriesSchema from './infrastructure/typeorm-categories.schema'

import { CATEGORIES_REPOSITORY } from './domain/categories.repository.interface'
import { CategoriesController } from './infrastructure/categories.controller'
import { CategoriesCrudService } from './application/categories.crud-service'
import { RemoteLLMCategoriesProviderAdapter } from './infrastructure/remote-llm-categories-provider.adapter'
import { CATEGORIES_PROVIDER } from './domain/ICategories-provider.interface'

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
    {
      provide: CATEGORIES_PROVIDER,
      useClass: RemoteLLMCategoriesProviderAdapter
    },
    CategoriesCrudService
  ],
  exports: [CATEGORIES_REPOSITORY, CATEGORIES_PROVIDER],
})
export class CategoriesModule {}
