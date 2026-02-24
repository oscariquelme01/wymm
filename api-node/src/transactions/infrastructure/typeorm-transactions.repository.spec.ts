import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { DataSource } from 'typeorm'
import { TypeORMTransactionsRepository } from './typeorm-transactions.repository'
import TransactionsSchema from './typeorm-transactions.schema'
import AccountsSchema from 'src/accounts/infrastructure/typeorm-accounts.schema'
import SessionsSchema from 'src/sessions/infrastructure/typeorm-sessions.schema'
import { Transaction } from '../domain/transaction.entity'

describe('TypeORMTransactionsRepository', () => {
  let container: StartedPostgreSqlContainer
  let dataSource: DataSource
  let repository: TypeORMTransactionsRepository
  let accountId: string

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:14').start()

    dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: [SessionsSchema, AccountsSchema, TransactionsSchema],
      synchronize: true,
    })

    await dataSource.initialize()

    repository = new TypeORMTransactionsRepository(dataSource)

    // Seed an account to satisfy the FK constraint
    const accountRepo = dataSource.getRepository('accounts')
    const account = await accountRepo.save({
      name: 'Test Account',
      currency: 'EUR',
      type: 'wants',
      institution: 'Test Bank',
      balance: 1000,
      externalId: 'ext-account-1',
      iban: 'DE89370400440532013000',
    })
    accountId = (account as any).id
  }, 60_000)

  afterAll(async () => {
    await dataSource?.destroy()
    await container?.stop()
  })

  beforeEach(async () => {
    await dataSource.getRepository('transactions').clear()
  })

  async function seedTransaction(
    overrides: Partial<Transaction> = {}
  ): Promise<Transaction> {
    const repo = dataSource.getRepository<Transaction>('transactions')
    return repo.save({
      amount: 100,
      currency: 'EUR',
      date: new Date('2025-03-15'),
      type: 'EXPENSE',
      description: 'Test transaction',
      externalId: `ext-${Date.now()}-${Math.random()}`,
      accountId,
      ...overrides,
    })
  }

  describe('findAll', () => {
    it('should return all transactions with their account relation', async () => {
      await seedTransaction({ description: 'Groceries' })
      await seedTransaction({ description: 'Rent' })

      const result = await repository.findAll({})

      expect(result).toHaveLength(2)
      expect(result[0].account).toBeDefined()
      expect(result[0].account.id).toBe(accountId)
    })

    it('should filter by date range', async () => {
      await seedTransaction({ date: new Date('2025-01-10') })
      await seedTransaction({ date: new Date('2025-03-15') })
      await seedTransaction({ date: new Date('2025-06-20') })

      const result = await repository.findAll({
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-30'),
      })

      expect(result).toHaveLength(1)
      expect(result[0].date).toEqual(new Date('2025-03-15'))
    })

    it('should filter by type', async () => {
      await seedTransaction({ type: 'EXPENSE' })
      await seedTransaction({ type: 'INCOME' })
      await seedTransaction({ type: 'EXPENSE' })

      const result = await repository.findAll({ type: 'INCOME' })

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('INCOME')
    })

    it('should filter by accountId', async () => {
      // Create a second account
      const accountRepo = dataSource.getRepository('accounts')
      const otherAccount = await accountRepo.save({
        name: 'Other Account',
        currency: 'USD',
        type: 'needs',
        institution: 'Other Bank',
        balance: 500,
        externalId: 'ext-account-2',
        iban: 'DE89370400440532013001',
      })
      const otherAccountId = (otherAccount as any).id

      await seedTransaction({ accountId })
      await seedTransaction({ accountId: otherAccountId })

      const result = await repository.findAll({ accountId })

      expect(result).toHaveLength(1)
      expect(result[0].accountId).toBe(accountId)
    })

    it('should return empty array when no transactions match', async () => {
      await seedTransaction({ type: 'EXPENSE' })
      await seedTransaction({ type: 'INCOME' })

      const result = await repository.findAll({ type: 'TRANSFER' })

      expect(result).toEqual([])
    })
  })

  describe('calculateTotal', () => {
    it('should sum all transaction amounts', async () => {
      await seedTransaction({ amount: 150.5 })
      await seedTransaction({ amount: 200.75 })
      await seedTransaction({ amount: -50 })

      const total = await repository.calculateTotal({})

      expect(total).toBeCloseTo(301.25)
    })

    it('should return 0 when no transactions exist', async () => {
      const total = await repository.calculateTotal({})

      expect(total).toBe(0)
    })

    it('should respect optional filters', async () => {
      await seedTransaction({ amount: 100, type: 'EXPENSE' })
      await seedTransaction({ amount: 200, type: 'INCOME' })
      await seedTransaction({ amount: 300, type: 'EXPENSE' })

      const total = await repository.calculateTotal({ type: 'EXPENSE' })

      expect(total).toBeCloseTo(400)
    })

    it('should respect date range filters', async () => {
      await seedTransaction({
        amount: 100,
        date: new Date('2025-01-15'),
      })
      await seedTransaction({
        amount: 200,
        date: new Date('2025-03-15'),
      })
      await seedTransaction({
        amount: 300,
        date: new Date('2025-06-15'),
      })

      const total = await repository.calculateTotal({
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-30'),
      })

      expect(total).toBeCloseTo(200)
    })
  })

  describe('getTimeseries', () => {
    it('should group transactions by day', async () => {
      await seedTransaction({
        amount: 100,
        date: new Date('2025-03-15'),
      })
      await seedTransaction({
        amount: 50,
        date: new Date('2025-03-15'),
      })
      await seedTransaction({
        amount: 200,
        date: new Date('2025-03-16'),
      })

      const result = await repository.getTimeseries('day', {})

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBeCloseTo(150)
      expect(result[1].amount).toBeCloseTo(200)
      expect(result[0].date.getTime()).toBeLessThan(result[1].date.getTime())
    })

    it('should group transactions by month', async () => {
      await seedTransaction({
        amount: 100,
        date: new Date('2025-03-10T12:00:00Z'),
      })
      await seedTransaction({
        amount: 50,
        date: new Date('2025-03-20T12:00:00Z'),
      })
      // A different month
      await seedTransaction({
        amount: 200,
        date: new Date('2025-05-15T12:00:00Z'),
      })

      const result = await repository.getTimeseries('month', {})

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBeCloseTo(150)
      expect(result[1].amount).toBeCloseTo(200)
    })

    it('should group transactions by week', async () => {
      // Same week: Mon 2025-03-10 to Sun 2025-03-16
      await seedTransaction({
        amount: 100,
        date: new Date('2025-03-10T12:00:00Z'),
      })
      await seedTransaction({
        amount: 50,
        date: new Date('2025-03-12T12:00:00Z'),
      })
      // Different week: Mon 2025-03-24+
      await seedTransaction({
        amount: 200,
        date: new Date('2025-03-24T12:00:00Z'),
      })

      const result = await repository.getTimeseries('week', {})

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBeCloseTo(150)
      expect(result[1].amount).toBeCloseTo(200)
    })

    it('should respect optional filters', async () => {
      await seedTransaction({
        amount: 100,
        date: new Date('2025-03-15'),
        type: 'EXPENSE',
      })
      await seedTransaction({
        amount: 200,
        date: new Date('2025-03-15'),
        type: 'INCOME',
      })

      const result = await repository.getTimeseries('day', {
        type: 'EXPENSE',
      })

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBeCloseTo(100)
    })

    it('should return empty array when no transactions exist', async () => {
      const result = await repository.getTimeseries('day', {})

      expect(result).toEqual([])
    })

    it('should order results by date ascending', async () => {
      await seedTransaction({
        amount: 300,
        date: new Date('2025-06-01'),
      })
      await seedTransaction({
        amount: 100,
        date: new Date('2025-01-01'),
      })
      await seedTransaction({
        amount: 200,
        date: new Date('2025-03-01'),
      })

      const result = await repository.getTimeseries('month', {})

      expect(result).toHaveLength(3)
      expect(result[0].amount).toBeCloseTo(100)
      expect(result[1].amount).toBeCloseTo(200)
      expect(result[2].amount).toBeCloseTo(300)

      for (let i = 1; i < result.length; i++) {
        expect(result[i].date.getTime()).toBeGreaterThan(
          result[i - 1].date.getTime()
        )
      }
    })
  })
})
