import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from 'src/banking/domain/IBanking-provider.interface'
import { ACCOUNTS_REPOSITORY, type AccountsRepository } from 'src/accounts/domain/accounts.repository.interface'

@Injectable()
export default class SyncAccountsUseCase {
  private readonly logger = new Logger(SyncAccountsUseCase.name)

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute() {
    this.logger.log(`Syncing bank transactions and balances`)
    const allAccounts = await this.accountsRepository.find()

    for (const account of allAccounts) {
      const response = await this.bankingProvider.getTransactions(account.externalId)

      return response
    }

    this.logger.log(`Done syncing bank transactions`)
  }
}
