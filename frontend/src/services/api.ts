import axios from 'axios'
import type { BankData, TimeseriesPoint, Transaction, Account, TransactionTypes, TransactionUpdate } from '@/types'

const api = axios.create({
  baseURL: 'http://localhost:3000',
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

export const fetchTimeseries = async (startDate: string, endDate: string, interval: 'day' | 'week' | 'month', type?: TransactionTypes): Promise<TimeseriesPoint[]> => {
  const response = await api.get('/analytics/timeseries', {
    params: { startDate, endDate, interval, type }
  })
  return response.data
}

export const fetchTransactions = async (startDate?: string, endDate?: string, type?: string, accountId?: string): Promise<Transaction[]> => {
  const response = await api.get('/transactions', {
    params: { startDate, endDate, type, accountId }
  })
  return response.data
}

export const fetchAccounts = async (): Promise<Account[]> => {
  const response = await api.get('/accounts')
  return response.data
}

export const fetchCashflow = async (startDate: string, endDate: string): Promise<number> => {
  const response = await api.get('/analytics/cashflow', {
    params: { startDate, endDate }
  })
  return response.data
}

export const fetchAggregateByType = async (
  startDate: string,
  endDate: string,
  type?: TransactionTypes
): Promise<number> => {
  const response = await api.get('/analytics/aggregate', {
    params: { startDate, endDate, type }
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

export default api

