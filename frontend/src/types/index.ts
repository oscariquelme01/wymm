export type TransactionTypes = 'EXPENSE' | 'INCOME' | 'TRANSFER'

export type CategorizationSource = 'user_overrides' | 'ml_model'

export interface TransactionCategorization {
  id: string
  source: CategorizationSource
  confidence: string | null
  category: Category
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  date: string
  type: TransactionTypes
  description: string
  externalId: string
  creditorName?: string
  debtorName?: string
  account: Account
  transactionCategorization: TransactionCategorization | null
}

export type AccountTypes = 'wants' | 'needs' | 'investments'

export interface Account {
  id: string
  name: string
  currency: string
  type: AccountTypes
  institution: string
  balance: number
  externalId: string
  iban: string
}

export interface AccountUpdate {
  name?: string
  type?: AccountTypes
  institution?: string
}

export interface TransactionUpdate {
  amount?: number
  date?: string
  type?: TransactionTypes
  description?: string
  accountId?: string
}

export interface BankData {
  name: string
  country: string
  accountTypes: string[]
  maximumConsentValidity: number
}

export interface AnalyticsAggregate {
  income: number
  expense: number
}

export interface TimeseriesPoint {
  date: string
  amount: number
}

export type AnalyticsQueryType = 'aggregate' | 'timeseries' | 'cashflow'

export type TimeseriesInterval = 'day' | 'week' | 'month'

export interface AnalyticsFilters {
  queryType: AnalyticsQueryType
  startDate: string
  endDate: string
  transactionType?: TransactionTypes
  interval?: TimeseriesInterval
  categoryId?: string
}

export type AnalyticsResult =
  | { kind: 'aggregate'; value: number; transactionType?: TransactionTypes }
  | { kind: 'timeseries'; data: TimeseriesPoint[]; interval: TimeseriesInterval; transactionType?: TransactionTypes }
  | { kind: 'cashflow'; value: number }

export interface Category {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryCreate {
  name: string
  parentId?: string | null
}

export interface CategoryUpdate {
  name?: string
  parentId?: string | null
}
