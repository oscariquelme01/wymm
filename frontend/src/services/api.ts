import axios from 'axios'
import type { BankData, TimeseriesPoint, Transaction, Account, AccountUpdate, TransactionTypes, TransactionUpdate, Category, CategoryCreate, CategoryUpdate } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000',
})

export const fetchBanks = async (): Promise<BankData[]> => {
  const response = await api.get('/banking/list-banks')
  return response.data
}

export const connectBank = async (institutionId: string, country: string): Promise<string> => {
  const response = await api.post('/auth/connect-account', {
    institutionId,
    country,
  })
  return response.data
}

export const fetchAggregate = async (startDate: string, endDate: string): Promise<{ income: number, expense: number }> => {
  const incomeRes = await api.get('/analytics/aggregate', {
    params: { startDate, endDate, type: 'INCOME' }
  })
  const expenseRes = await api.get('/analytics/aggregate', {
    params: { startDate, endDate, type: 'EXPENSE' }
  })
  return {
    income: incomeRes.data,
    expense: expenseRes.data
  }
}

export const fetchTimeseries = async (startDate: string, endDate: string, interval: 'day' | 'week' | 'month', type?: TransactionTypes, categoryId?: string): Promise<TimeseriesPoint[]> => {
  const response = await api.get('/analytics/timeseries', {
    params: { startDate, endDate, interval, type, categoryId }
  })
  return response.data
}

export const fetchTransactions = async (startDate?: string, endDate?: string, type?: string, accountId?: string, minAmount?: number, maxAmount?: number, categoryId?: string): Promise<Transaction[]> => {
  const response = await api.get('/transactions', {
    params: { startDate, endDate, type, accountId, minAmount, maxAmount, categoryId }
  })
  return response.data
}

export const fetchAccounts = async (): Promise<Account[]> => {
  const response = await api.get('/accounts')
  return response.data
}

export const updateAccount = async (id: string, data: AccountUpdate): Promise<Account> => {
  const response = await api.patch(`/accounts/${id}`, data)
  return response.data
}

export const deleteAccount = async (id: string): Promise<void> => {
  await api.delete(`/accounts/${id}`)
}

export const syncAccount = async (id: string): Promise<void> => {
  await api.post(`/accounts/${id}/sync`)
}

export const syncAllAccounts = async (): Promise<void> => {
  await api.post('/accounts/sync-accounts')
}

export const fetchCashflow = async (startDate: string, endDate: string, categoryId?: string): Promise<number> => {
  const response = await api.get('/analytics/cashflow', {
    params: { startDate, endDate, categoryId }
  })
  return response.data
}

export const fetchAggregateByType = async (
  startDate: string,
  endDate: string,
  type?: TransactionTypes,
  categoryId?: string
): Promise<number> => {
  const response = await api.get('/analytics/aggregate', {
    params: { startDate, endDate, type, categoryId }
  })
  return response.data
}

export const updateTransaction = async (
  id: string,
  data: TransactionUpdate
): Promise<Transaction> => {
  const response = await api.patch(`/transactions/${id}`, data)
  return response.data
}

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`)
}

// Categories

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories')
  return response.data
}

export const fetchCategory = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`)
  return response.data
}

export const createCategory = async (data: CategoryCreate): Promise<Category> => {
  const response = await api.post('/categories', data)
  return response.data
}

export const updateCategory = async (id: string, data: CategoryUpdate): Promise<Category> => {
  const response = await api.patch(`/categories/${id}`, data)
  return response.data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}

export default api

