import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { DataSource } from 'typeorm'
import { TypeORMAccountsRepository } from 'src/accounts/infrastructure/typeorm-accounts.repository'
import { TypeORMTransactionsRepository } from 'src/transactions/infrastructure/typeorm-transactions.repository'
import SessionsSchema from 'src/sessions/infrastructure/typeorm-sessions.schema'
import AccountsSchema from 'src/accounts/infrastructure/typeorm-accounts.schema'
import TransactionsSchema from 'src/transactions/infrastructure/typeorm-transactions.schema'
import TransactionsCategorizationSchema from 'src/transactions/infrastructure/typeorm-transactions-categorization.schema'
import CategoriesSchema from 'src/categories/infrastructure/typeorm-categories.schema'
import { Account, AccountTypes } from 'src/accounts/domain/account.entity'
import { Transaction } from 'src/transactions/domain/transaction.entity'
import { DeepPartial } from 'src/db/domain/base.repository.interface'

const ALL_SCHEMAS = [
  SessionsSchema,
  AccountsSchema,
  TransactionsSchema,
  TransactionsCategorizationSchema,
  CategoriesSchema,
]

export class TestContext {
  private container: StartedPostgreSqlContainer
  private _dataSource: DataSource

  readonly accounts: TypeORMAccountsRepository
  readonly transactions: TypeORMTransactionsRepository

  private constructor(
    container: StartedPostgreSqlContainer,
    dataSource: DataSource
  ) {
    this.container = container
    this._dataSource = dataSource
    this.accounts = new TypeORMAccountsRepository(dataSource)
    this.transactions = new TypeORMTransactionsRepository(dataSource)
  }

  get dataSource(): DataSource {
    return this._dataSource
  }

  static async create(): Promise<TestContext> {
    const container = await new PostgreSqlContainer('postgres:14').start()

    const dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: ALL_SCHEMAS,
      synchronize: true,
    })

    await dataSource.initialize()

    return new TestContext(container, dataSource)
  }

  async destroy(): Promise<void> {
    await this._dataSource?.destroy()
    await this.container?.stop()
  }

  async clean(): Promise<void> {
    // TRUNCATE with CASCADE handles FK ordering for us
    await this._dataSource.query(
      `TRUNCATE "transactionsCategorization", "transactions", "accounts", "sessions", "categories" CASCADE`
    )
  }

  async seedAccount(
    overrides: DeepPartial<Account> = {}
  ): Promise<Account> {
    const repo = this._dataSource.getRepository<Account>('accounts')
    return repo.save({
      name: 'Test Account',
      currency: 'EUR',
      type: AccountTypes.WANTS,
      institution: 'Test Bank',
      balance: 1000,
      externalId: `ext-${Date.now()}-${Math.random()}`,
      iban: `DE${Date.now()}`,
      ...overrides,
    })
  }

  async seedTransaction(
    accountId: string,
    overrides: DeepPartial<Transaction> = {}
  ): Promise<Transaction> {
    const repo = this._dataSource.getRepository<Transaction>('transactions')
    return repo.save({
      amount: 100,
      currency: 'EUR',
      date: new Date('2025-03-15'),
      type: 'EXPENSE',
      description: 'Test transaction',
      externalId: `ext-${Date.now()}-${Math.random()}`,
      account: { id: accountId },
      ...overrides,
    })
  }
}
