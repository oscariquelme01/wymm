import BaseModel from "src/db/domain/base.entity"

export enum TokenTypes {
  API_TOKEN = 'apiToken',
  SESSION_TOKEN = 'sessionToken',
}

export interface Token extends BaseModel {
  type: TokenTypes
  expiresAt: Date
  value: string
}
