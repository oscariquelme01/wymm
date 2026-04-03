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
  TRANSACTION_MANAGER,
  type TransactionManager,
} from 'src/db/domain/transaction-manager.interface'
import { Account } from '../domain/account.entity'
import StoreTransactionsUseCase from 'src/transactions/application/store-transactions.use-case'
import { DetectTransferUseCase } from './detect-transfer.use-case'

export interface SyncResult {
  accountsSynced: number
  newTransactions: number
  errors: string[]
}

@Injectable()
export default class SyncAccountsUseCase {
  private readonly logger = new Logger(SyncAccountsUseCase.name)

  constructor(
    private readonly storeTransactionsUseCase: StoreTransactionsUseCase,
    private readonly detectTransferUseCase: DetectTransferUseCase,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(fullSync = false): Promise<SyncResult> {
    const result: SyncResult = {
      accountsSynced: 0,
      newTransactions: 0,
      errors: [],
    }

    try {
      await this.transactionManager.start()
      this.logger.log(`Syncing bank accounts`)
      const allAccounts = await this.accountsRepository.find()

      for (const account of allAccounts) {
        this.logger.debug(
          `Syncing account with id ${account.id} and name ${account.name}...`
        )

        try {
          const newTxns = await this.syncTransactions(account, fullSync)
          await this.syncBalances(account)
          result.accountsSynced++
          result.newTransactions += newTxns
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          this.logger.error(
            `Failed to sync account ${account.name}: ${message}`
          )
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

  private async syncTransactions(
    account: Account,
    fullSync = false
  ): Promise<number> {
    const today = new Date();
    // Simple way to get 24 hours ago at midnight
    const yesterday = new Date(today.setHours(0, 0, 0, 0) - 86400000);

    const response = await this.bankingProvider.getTransactions(
      account.externalId,
      ...(fullSync ? [] : [yesterday, new Date()])
    );
    const transactions = response.transactionData

    this.logger.debug(`Found ${transactions.length} transactions`)

    const savedTransactions = await this.storeTransactionsUseCase.execute(account.id!, transactions)

    for (const transaction of transactions) {
      if (transaction.counterpartIban) {
        const saved = savedTransactions.find((s) => s.externalId === transaction.externalId)
        if (saved) {
          await this.detectTransferUseCase.execute(saved, transaction.counterpartIban)
        }
      }
    }

    return savedTransactions.length
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
