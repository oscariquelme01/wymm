export type TransactionTypes = 'EXPENSE' | 'INCOME' | 'TRANSFER'

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
}

export interface Account {
  id: string
  name: string
  currency: string
  type: 'wants' | 'needs' | 'investments'
  institution: string
  balance: number
  externalId: string
  iban: string
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
}

export type AnalyticsResult =
  | { kind: 'aggregate'; value: number; transactionType?: TransactionTypes }
  | { kind: 'timeseries'; data: TimeseriesPoint[]; interval: TimeseriesInterval; transactionType?: TransactionTypes }
  | { kind: 'cashflow'; value: number }
