import BaseModel from "src/db/domain/base.entity"

export interface Session extends BaseModel {
  expiresAt: Date
  accountId: string
}
