import { EntitySchema } from 'typeorm'
import { Category } from '../domain/category.entity'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'
import { type } from 'os'

const CategoriesSchema = new EntitySchema<Category>({
  name: APP_MODULES.CATEGORIES,
  tableName: APP_MODULES.CATEGORIES,
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    parentId: {
      type: String,
      nullable: true
    }
  }
})

export default CategoriesSchema
