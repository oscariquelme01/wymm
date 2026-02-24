import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Transaction } from '../domain/transaction.entity'
import { TransactionsRepository, OptionalQueryParams } from '../domain/transactions.repository.interface'
import { SelectQueryBuilder } from 'typeorm'

export class TypeORMTransactionsRepository
  extends TypeORMBaseRepository<Transaction>
  implements TransactionsRepository
{
  protected module = APP_MODULES.TRANSACTIONS

  private buildOptionalQueryParams(query: SelectQueryBuilder<Transaction>, optionalParams: OptionalQueryParams) {
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
  }

  async calculateTotal(optionalQueryParams: OptionalQueryParams): Promise<number> {
    const query = this.repository()
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')

    this.buildOptionalQueryParams(query, optionalQueryParams)

    const result = await query.getRawOne()
    return result.total ? parseFloat(result.total) : 0
  }

  async getTimeseries(
    interval: 'day' | 'week' | 'month',
    optionalParams: OptionalQueryParams
  ): Promise<{ date: Date; amount: number }[]> {

    const query = this.repository()
      .createQueryBuilder('transaction')
      .select(`DATE_TRUNC(:interval, transaction.date)`, 'date') // Use alias 'date'
      .addSelect('SUM(transaction.amount)', 'amount')
      .groupBy('date')
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
