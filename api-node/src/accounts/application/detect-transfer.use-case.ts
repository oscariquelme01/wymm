import { Injectable, Inject, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Between } from 'typeorm'
import {
  TRANSACTIONS_REPOSITORY,
  type TransactionsRepository,
} from 'src/transactions/domain/transactions.repository.interface'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../domain/accounts.repository.interface'
import { Transaction } from 'src/transactions/domain/transaction.entity'

@Injectable()
export class DetectTransferUseCase {
  private readonly logger = new Logger(DetectTransferUseCase.name)

  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute(transaction: Transaction, counterpartIban: string) {
    const accounts = await this.accountsRepository.find()
    const ibanToAccountId = new Map(
      accounts.map((a) => [a.iban, a.id])
    )

    const counterpartAccountId = ibanToAccountId.get(counterpartIban)
    if (!counterpartAccountId) return

    this.logger.log(
      `Transfer detected for transaction ${transaction.id} — counterpart IBAN ${counterpartIban} matches account ${counterpartAccountId}`
    )

    const twoDaysMs = 2 * 24 * 60 * 60 * 1000
    const dateFrom = new Date(transaction.date.getTime() - twoDaysMs)
    const dateTo = new Date(transaction.date.getTime() + twoDaysMs)
    const oppositeAmount = -transaction.amount

    const candidates = await this.transactionsRepository.find({
      where: {
        account: { id: counterpartAccountId },
        amount: oppositeAmount,
        date: Between(dateFrom, dateTo),
      } as any,
    })

    const otherLeg = candidates[0]
    const transferGroupId = otherLeg?.transferGroupId ?? randomUUID()

    if (otherLeg) {
      this.logger.log(
        `Linked transfer: ${transaction.id} <-> ${otherLeg.id} (group ${transferGroupId})`
      )
    }

    await this.transactionsRepository.update(
      { id: transaction.id },
      { type: 'TRANSFER', transferGroupId }
    )
  }
}
