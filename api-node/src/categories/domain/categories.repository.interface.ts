import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Category } from './category.entity'

export const CATEGORIES_REPOSITORY = 'CATEGORIES_REPOSITORY'
export interface CategoriesRepository extends BaseRepository<Category> {}
