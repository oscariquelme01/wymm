import { EntitySchema } from 'typeorm'
import { Transaction } from '../domain/transaction.entity'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'

const TransactionsSchema = new EntitySchema<Transaction>({
  name: APP_MODULES.TRANSACTIONS,
  tableName: APP_MODULES.TRANSACTIONS,
  columns: {
    ...BaseSchema,
    amount: {
      type: 'decimal',
    },
    currency: {
      type: String,
    },
    date: {
      type: Date,
    },
    type: {
      type: 'enum',
      enum: ['EXPENSE', 'INCOME', 'TRANSFER'],
    },
    description: {
      type: String,
    },
    externalId: {
      type: String,
    },
    creditorName: {
      type: String,
      nullable: true,
    },
    debtorName: {
      type: String,
      nullable: true,
    }
  },
  relations: {
    account: {
      type: 'many-to-one',
      target: APP_MODULES.ACCOUNTS,
      joinColumn: {
        name: 'accountId',
      },
    },
  },
})

export default TransactionsSchema
