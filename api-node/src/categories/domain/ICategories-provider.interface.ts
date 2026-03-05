import { TransactionTypes } from "src/transactions/domain/transaction.entity"

export enum ConfidenceLevels {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const CATEGORIES_QUEUE = 'categories_classification_queue'


export interface TransactionData {
    description: String
    amount?: number
    type: TransactionTypes
}

export interface CategorizedTransactionData {
  transaction: string
  category: string
  confidence: ConfidenceLevels
}

export interface ICategoriesProvider {
  categorizeTransaction(transaction: TransactionData): Promise<CategorizedTransactionData>
  categorizeBulkTransactions(transactions: TransactionData[]): Promise<CategorizedTransactionData[]>
}

export const CATEGORIES_PROVIDER = 'CATEGORIES_PROVIDER'
