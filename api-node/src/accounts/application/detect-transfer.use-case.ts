import { Injectable, Inject, Logger } from '@nestjs/common'
import { Between, Not } from 'typeorm'
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

  async execute(transaction: Transaction, counterpartIban?: string) {
    // grabs all accounts and creates a map iban -> id
    const accounts = await this.accountsRepository.find()
    const ibanToAccountId = new Map(
      accounts.map((a) => [a.iban, a.id])
    )

    // did the bank provider filled the counterpartIban?
    const counterpartAccountId = counterpartIban
      ? ibanToAccountId.get(counterpartIban)
      : undefined

    // the bank provider filled the counterpartIban but it's not one of the user's account
    if (counterpartIban && !counterpartAccountId) return

    if (counterpartAccountId) {
      this.logger.log(
        `Transfer detected via IBAN for transaction ${transaction.id} — counterpart IBAN ${counterpartIban} matches account ${counterpartAccountId}`
      )
    }

    const twoDaysMs = 2 * 24 * 60 * 60 * 1000
    const dateFrom = new Date(transaction.date.getTime() - twoDaysMs)
    const dateTo = new Date(transaction.date.getTime() + twoDaysMs)
    const oppositeAmount = -transaction.amount

    // find all transactions within two days using either the accountId found or accountId !=  
    const candidates = await this.transactionsRepository.find({
      where: {
        account: { id: counterpartAccountId ?? Not(transaction.accountId) },
        amount: oppositeAmount,
        date: Between(dateFrom, dateTo),
      } as any,
    })

    const otherLeg = candidates[0]
    if (!otherLeg && !counterpartAccountId) return

    if (!counterpartAccountId && otherLeg) {
      this.logger.log(
        `Transfer detected via amount+date fallback for transaction ${transaction.id} — matched with ${otherLeg.id}`
      )
    }

    const transferGroupId = otherLeg?.transferGroupId!

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
