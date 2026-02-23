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
        // fetch new transactions
        const transactions = await this.bankingProvider.getTransactions(
          account.externalId
        )
        for (const transaction of transactions) {
          await this.transactionsRepository.save({
            ...transaction,
            accountId: account.id,
          })
        }

        // update balances
        const balance = await this.bankingProvider.getBalance(account.externalId)
        await this.accountsRepository.update({ id: account.id }, { balance: balance[0].amount }) // TODO: this balance[0] doesn't look right
      }

      this.logger.log(`Done syncing accounts`)
      await this.transactionManager.commit()
    } catch (e) {
      this.logger.error(e)
      await this.transactionManager.rollback()
    }
  }
}
