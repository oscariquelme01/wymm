import { TestContext } from 'src/test/test-context'
import SyncAccountsUseCase from './sync-accounts.use-case'
import { DetectTransferUseCase } from './detect-transfer.use-case'
import StoreTransactionsUseCase from 'src/transactions/application/store-transactions.use-case'
import {
  IBankingProvider,
  TransactionData,
  BalanceData,
} from 'src/banking/domain/IBanking-provider.interface'
import { TransactionManager } from 'src/db/domain/transaction-manager.interface'

function createMockBankingProvider(
  transactionsByAccount: Record<string, TransactionData[]>,
  balancesByAccount: Record<string, BalanceData>
): IBankingProvider {
  return {
    listAvailableBanks: jest.fn(),
    startBankAuth: jest.fn(),
    authorizeSession: jest.fn(),
    getSessionData: jest.fn(),
    getTransactions: jest.fn(async (accountId: string) => ({
      transactionData: transactionsByAccount[accountId] ?? [],
      isDone: true,
    })),
    getBalance: jest.fn(async (accountId: string) => (
      balancesByAccount[accountId] ?? { amount: 0, currency: 'EUR' }
    )),
  }
}

const noOpTransactionManager: TransactionManager = {
  start: async () => {},
  run: async <T>(fn: () => Promise<T>) => fn(),
  commit: async () => {},
  rollback: async () => {},
}

describe('SyncAccountsUseCase', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await TestContext.create()
  }, 60_000)

  afterAll(async () => {
    await ctx?.destroy()
  })

  afterEach(async () => {
    await ctx.clean()
  })

  function buildUseCase(bankingProvider: IBankingProvider): SyncAccountsUseCase {
    const mockQueue = { add: jest.fn() } as any
    const storeTransactions = new StoreTransactionsUseCase(ctx.transactions, mockQueue)
    const detectTransfer = new DetectTransferUseCase(ctx.transactions, ctx.accounts)

    return new SyncAccountsUseCase(
      storeTransactions,
      detectTransfer,
      noOpTransactionManager,
      bankingProvider,
      ctx.accounts
    )
  }

  it('should detect transfers between two accounts via counterpart IBAN', async () => {
    await ctx.seedAccount({
      name: 'Checking',
      iban: 'ES1111111111111111111111',
      externalId: 'ext-checking',
    })
    await ctx.seedAccount({
      name: 'Savings',
      iban: 'ES2222222222222222222222',
      externalId: 'ext-savings',
    })

    const bankingProvider = createMockBankingProvider(
      {
        'ext-checking': [
          {
            amount: 500,
            currency: 'EUR',
            date: new Date('2025-03-15'),
            description: 'Transfer to savings',
            externalId: 'txn-a1',
            type: 'EXPENSE',
            counterpartIban: 'ES2222222222222222222222',
          },
        ],
        'ext-savings': [
          {
            amount: 500,
            currency: 'EUR',
            date: new Date('2025-03-15'),
            description: 'Transfer from checking',
            externalId: 'txn-b1',
            type: 'INCOME',
            counterpartIban: 'ES1111111111111111111111',
          },
        ],
      },
      {
        'ext-checking': { amount: 500, currency: 'EUR' },
        'ext-savings': { amount: 6500, currency: 'EUR' },
      }
    )

    const useCase = buildUseCase(bankingProvider)
    await useCase.execute(true)

    const allTransactions = await ctx.transactions.find()

    expect(allTransactions).toHaveLength(2)

    const transferA = allTransactions.find((t) => t.externalId === 'txn-a1')!
    const transferB = allTransactions.find((t) => t.externalId === 'txn-b1')!

    expect(transferA.type).toBe('TRANSFER')
    expect(transferB.type).toBe('TRANSFER')
    expect(transferA.transferGroupId).toBeDefined()
    expect(transferA.transferGroupId).toBe(transferB.transferGroupId)
  })

  it('should sync transactions without transfers when no pairs match', async () => {
    await ctx.seedAccount({
      name: 'Checking',
      iban: 'ES1111111111111111111111',
      externalId: 'ext-checking',
    })

    const bankingProvider = createMockBankingProvider(
      {
        'ext-checking': [
          {
            amount: 50,
            currency: 'EUR',
            date: new Date('2025-03-15'),
            description: 'Coffee',
            externalId: 'txn-coffee',
            type: 'EXPENSE',
          },
        ],
      },
      {
        'ext-checking': { amount: 950, currency: 'EUR' },
      }
    )

    const useCase = buildUseCase(bankingProvider)
    await useCase.execute(true)

    const allTransactions = await ctx.transactions.find()

    expect(allTransactions).toHaveLength(1)
    expect(allTransactions[0].type).toBe('EXPENSE')
    expect(allTransactions[0].transferGroupId).toBeNull()
  })

  it('should update account balances after sync', async () => {
    const account = await ctx.seedAccount({
      name: 'Checking',
      iban: 'ES1111111111111111111111',
      externalId: 'ext-checking',
      balance: 1000,
    })

    const bankingProvider = createMockBankingProvider(
      { 'ext-checking': [] },
      { 'ext-checking': { amount: 448.06, currency: 'EUR' } }
    )

    const useCase = buildUseCase(bankingProvider)
    await useCase.execute(true)

    const updated = await ctx.accounts.findOneBy({ id: account.id } as any)

    expect(Number(updated!.balance)).toBeCloseTo(448.06)
  })
})
