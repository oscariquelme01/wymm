import { EntitySchema } from 'typeorm'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'
import { CategorizationSource, TransactionCategorization } from '../domain/transaction-categorization.entity'

const TransactionsCategorizationSchema = new EntitySchema<TransactionCategorization>({
  name: APP_MODULES.TRANSACTIONS_CATEGORIZATION,
  tableName: APP_MODULES.TRANSACTIONS_CATEGORIZATION,
  columns: {
    ...BaseSchema,
    source: {
      type: 'enum',
      enum: CategorizationSource,
    },
    confidence: {
      type: String,
      nullable: true
    },
    reasoning: {
      type: String,
      nullable: true
    }
  },
  relations: {
    transaction: {
      type: 'one-to-one',
      target: APP_MODULES.TRANSACTIONS,
      joinColumn: {
        name: 'transactionId'
      },
      onDelete: 'CASCADE',
    },
    category: {
      type: 'many-to-one',
      target: APP_MODULES.CATEGORIES,
      joinColumn: {
        name: 'categoryId'
      }
    }
  },
})

export default TransactionsCategorizationSchema
