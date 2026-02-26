import BaseModel from 'src/db/domain/base.entity'

export interface Category extends BaseModel {
  name: string,
  parentId: string | null
}
