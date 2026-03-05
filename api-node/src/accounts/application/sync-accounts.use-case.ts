import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from 'src/banking/domain/IBanking-provider.interface'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from 'src/accounts/domain/accounts.repository.interface'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from 'src/db/domain/transaction-manager.interface'
import { Account } from '../domain/account.entity'
import { CategorizationSource } from 'src/transactions/domain/transaction-categorization.entity'
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from 'src/categories/domain/categories.repository.interface'
import {
  TRANSACTIONS_CATEGORIZATION_REPOSITORY,
  type TransactionsCategorizationRepository,
} from 'src/transactions/domain/transactions-categorization.repository'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { CATEGORIES_QUEUE } from 'src/categories/domain/ICategories-provider.interface'

export interface SyncResult {
  accountsSynced: number
  newTransactions: number
  errors: string[]
}

@Injectable()
export default class SyncAccountsUseCase {
  private readonly logger = new Logger(SyncAccountsUseCase.name)

  constructor(
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @InjectQueue(CATEGORIES_QUEUE)
    private readonly categoriesQueue: Queue,
  ) {}

  async execute(): Promise<SyncResult> {
    const result: SyncResult = { accountsSynced: 0, newTransactions: 0, errors: [] }

    try {
      await this.transactionManager.start()
      this.logger.log(`Syncing bank accounts`)
      const allAccounts = await this.accountsRepository.find()

      for (const account of allAccounts) {
        this.logger.debug(
          `Syncing account with id ${account.id} and name ${account.name}...`
        )

        try {
          const newTxns = await this.syncTransactions(account)
          await this.syncBalances(account)
          result.accountsSynced++
          result.newTransactions += newTxns
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          this.logger.error(`Failed to sync account ${account.name}: ${message}`)
          result.errors.push(`${account.name}: ${message}`)
        }
      }

      this.logger.log(`Done syncing accounts`)
      await this.transactionManager.commit()
    } catch (e) {
      this.logger.error(e)
      await this.transactionManager.rollback()
      throw e
    }

    return result
  }

  private async syncTransactions(account: Account): Promise<number> {
    let newCount = 0
    const transactions = await this.bankingProvider.getLatestTransactions(
      account.externalId
    )
    this.logger.debug(`Found ${transactions.length} transactions`)

    for (const transaction of transactions) {
      const existingTransaction = await this.transactionsRepository.findOneBy({
        externalId: transaction.externalId,
        account: { id: account.id },
      })

      if (!existingTransaction) {
        const savedTransaction = await this.transactionsRepository.save({
          ...transaction,
          account: { id: account.id },
          transactionCategorization: undefined
        })
        newCount++

        await this.categoriesQueue.add('categorize-transaction', {
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          id: savedTransaction.id
        })
      }
    }

    return newCount
  }

  private async syncBalances(account: Account) {
    const balances = await this.bankingProvider.getBalance(account.externalId)
    this.logger.debug(
      `Balance for the account ${account.id}: ${balances.amount}`
    )
    await this.accountsRepository.update(
      { id: account.id },
      { balance: balances.amount }
    )
  }
}
