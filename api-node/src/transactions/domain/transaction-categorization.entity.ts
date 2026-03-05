import { Category } from "src/categories/domain/category.entity"
import BaseModel from "src/db/domain/base.entity"
import { Transaction } from "src/transactions/domain/transaction.entity"

export enum CategorizationSource {
  USER_OVERRIDES = 'user_overrides',
  ML_MODEL = 'ml_model',
}


export interface TransactionCategorization extends BaseModel {
  source: CategorizationSource
  confidence: string | null
  reasoning: string | null
  transaction: Transaction
  category: Category
}
