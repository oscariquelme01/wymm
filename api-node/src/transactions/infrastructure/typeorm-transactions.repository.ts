import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Transaction } from '../domain/transaction.entity'
import {
  TransactionsRepository,
  OptionalQueryParams,
} from '../domain/transactions.repository.interface'
import { SelectQueryBuilder } from 'typeorm'

export class TypeORMTransactionsRepository
  extends TypeORMBaseRepository<Transaction>
  implements TransactionsRepository
{
  protected module = APP_MODULES.TRANSACTIONS

  private buildOptionalQueryParams(
    query: SelectQueryBuilder<Transaction>,
    optionalParams: OptionalQueryParams
  ) {
    if (optionalParams.endDate) {
      const finalEndDate = new Date(optionalParams.endDate)
      finalEndDate.setHours(23, 59, 59, 999)
      query.andWhere('transaction.date <= :endDate', { endDate: finalEndDate })
    }

    if (optionalParams.startDate) {
      const finalStartDate = new Date(optionalParams.startDate)
      finalStartDate.setHours(0, 0, 0, 0)
      query.andWhere('transaction.date >= :startDate', {
        startDate: finalStartDate,
      })
    }

    if (optionalParams.type) {
      query.andWhere('transaction.type = :type', { type: optionalParams.type })
    }

    if (optionalParams.accountId) {
      query.andWhere('transaction.accountId = :accountId', {
        accountId: optionalParams.accountId,
      })
    }

    if (optionalParams.minAmount !== undefined) {
      query.andWhere('transaction.amount >= :minAmount', {
        minAmount: optionalParams.minAmount,
      })
    }

    if (optionalParams.maxAmount !== undefined) {
      query.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: optionalParams.maxAmount,
      })
    }
  }

  async findAll(
    optionalQueryParams: OptionalQueryParams
  ): Promise<Array<Transaction>> {
    const query = this.repository()
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.transactionCategorization', 'categorization')
      .leftJoinAndSelect('categorization.category', 'category')

    this.buildOptionalQueryParams(query, optionalQueryParams)

    return await query.getMany()
  }

  async calculateTotal(
    optionalQueryParams: OptionalQueryParams
  ): Promise<number> {
    const query = this.repository()
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')

    this.buildOptionalQueryParams(query, optionalQueryParams)

    const result = await query.getRawOne()
    return result.total ? parseFloat(result.total) : 0
  }

  async findTransferCandidates(
    transaction: Transaction,
    counterpartAccountId?: string
  ): Promise<Transaction[]> {
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000
    const dateFrom = new Date(transaction.date.getTime() - twoDaysMs)
    const dateTo = new Date(transaction.date.getTime() + twoDaysMs)

    const query = this.repository()
      .createQueryBuilder('transaction')
      .andWhere('transaction.amount = :amount', { amount: transaction.amount })
      .andWhere('transaction.date BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      })

    if (counterpartAccountId) {
      query.andWhere('transaction.accountId = :accountId', {
        accountId: counterpartAccountId,
      })
    } else {
      query.andWhere('transaction.accountId != :accountId', {
        accountId: transaction.account.id,
      })
    }

    return query.getMany()
  }

  async linkTransfer(
    transactionIds: string[],
    transferGroupId: string
  ): Promise<void> {
    await this.repository()
      .createQueryBuilder()
      .update()
      .set({ type: 'TRANSFER', transferGroupId } as any)
      .whereInIds(transactionIds)
      .execute()
  }

  async getTimeseries(
    interval: 'day' | 'week' | 'month',
    optionalParams: OptionalQueryParams
  ): Promise<{ date: Date; amount: number }[]> {
    const query = this.repository()
      .createQueryBuilder('transaction')
      .select(`DATE_TRUNC(:interval, transaction.date)`, 'date') // Use alias 'date'
      .addSelect('SUM(transaction.amount)', 'amount')
      .groupBy(`DATE_TRUNC(:interval, transaction.date)`)
      .orderBy('date', 'ASC')
      .setParameter('interval', interval)

    this.buildOptionalQueryParams(query, optionalParams)

    const result = await query.getRawMany()

    return result.map((item) => ({
      date: item.date,
      amount: item.amount ? parseFloat(item.amount) : 0,
    }))
  }
}
