import type { Transaction, Account } from '../types'


export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 150.00,
    currency: 'USD',
    date: '2023-10-25T10:00:00Z',
    type: 'EXPENSE',
    description: 'Grocery Store',
    externalId: 'ext_1',
    accountId: 'acc_1',
  },
  {
    id: '2',
    amount: 2500.00,
    currency: 'USD',
    date: '2023-10-24T10:00:00Z',
    type: 'INCOME',
    description: 'Salary',
    externalId: 'ext_2',
    accountId: 'acc_1',
  },
  {
    id: '3',
    amount: 45.99,
    currency: 'USD',
    date: '2023-10-23T14:30:00Z',
    type: 'EXPENSE',
    description: 'Amazon Purchase',
    externalId: 'ext_3',
    accountId: 'acc_1',
  },
  {
    id: '4',
    amount: 12.50,
    currency: 'USD',
    date: '2023-10-22T09:15:00Z',
    type: 'EXPENSE',
    description: 'Coffee Shop',
    externalId: 'ext_4',
    accountId: 'acc_2',
  },
  {
    id: '5',
    amount: 120.00,
    currency: 'USD',
    date: '2023-10-21T18:00:00Z',
    type: 'EXPENSE',
    description: 'Restaurant Dinner',
    externalId: 'ext_5',
    accountId: 'acc_1',
  },
]

export const mockAccounts: Account[] = [
  {
    id: 'acc_1',
    name: 'Checking Account',
    currency: 'USD',
    type: 'needs',
    institution: 'Chase',
    balance: 5432.10,
    externalId: 'ext_acc_1',
    iban: 'US123456789',
  },
  {
    id: 'acc_2',
    name: 'Savings Account',
    currency: 'USD',
    type: 'investments',
    institution: 'Ally',
    balance: 12500.00,
    externalId: 'ext_acc_2',
    iban: 'US987654321',
  },
]
