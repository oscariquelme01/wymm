export type BaseModelFields =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'version'

export default class BaseModel<T = string> {
  constructor(data: any = null) {
    Object.assign(this, data)
  }

  id?: T
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  version?: number
}
