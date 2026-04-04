import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../domain/accounts.repository.interface'
import { Transaction } from 'src/transactions/domain/transaction.entity'
import { randomUUID } from 'crypto'

@Injectable()
export class DetectTransferUseCase {
  private readonly logger = new Logger(DetectTransferUseCase.name)

  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute(transaction: Transaction, counterpartIban?: string) {
    const allAccounts = await this.accountsRepository.find({})
    const counterPartAccount = allAccounts.find((acc) => acc.iban === counterpartIban)

    const candidates = await this.transactionsRepository.findTransferCandidates(
      transaction,
      counterPartAccount ? counterPartAccount.id : undefined
    )
    if (!candidates.length) return // just return, this might happen because the other leg of the transfer is not stored in DB yet

    this.logger.log(`Found a transfer for transaction with amount ${transaction.amount} in account ${transaction.account.name}`)

    const otherLeg = candidates[0]
    const transferGroupId = randomUUID()

    await this.transactionsRepository.linkTransfer(
      [transaction.id!, otherLeg.id!],
      transferGroupId
    )
  }
}
