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
    private readonly transactionsRepository: TransactionsRepository
  ) {}

  async execute() {
    try {
      await this.transactionManager.start()
      this.logger.log(`Syncing bank accounts`)
      const allAccounts = await this.accountsRepository.find()

      for (const account of allAccounts) {
        this.logger.debug(
          `Syncing account with id ${account.id} and name ${account.name}...`
        )

        await this.syncTransactions(account)
        await this.syncBalances(account)
      }

      this.logger.log(`Done syncing accounts`)
      await this.transactionManager.commit()
    } catch (e) {
      this.logger.error(e)
      await this.transactionManager.rollback()
    }
  }

  private async syncTransactions(account: Account) {
    const transactions = await this.bankingProvider.getTransactions(
      account.externalId
    )
    this.logger.debug(`Found ${transactions.length} transactions`)

    for (const transaction of transactions) {
      const existingTransaction = await this.transactionsRepository.findOneBy({
        externalId: transaction.externalId,
        account: { id: account.id },
      })

      if (!existingTransaction) {
        await this.transactionsRepository.save({
          ...transaction,
          account: { id: account.id },
        })
      }
    }
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
