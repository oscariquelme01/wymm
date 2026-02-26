import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Category } from '../domain/category.entity'
import { CategoriesRepository } from '../domain/categories.repository.interface'

export class TypeORMCategoriesRepository
  extends TypeORMBaseRepository<Category>
  implements CategoriesRepository
{
  protected module = APP_MODULES.CATEGORIES
}
