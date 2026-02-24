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
  accountId: string
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
