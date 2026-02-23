import { EntitySchema } from 'typeorm'
import { Account, AccountTypes } from '../domain/account.entity'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'

const AccountsSchema = new EntitySchema<Account>({
  name: APP_MODULES.ACCOUNTS,
  tableName: APP_MODULES.ACCOUNTS,
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    currency: {
      type: String,
    },
    type: {
      type: 'enum',
      enum: AccountTypes,
    },
    institution: {
      type: String,
    },
    balance: {
      type: 'decimal',
    },
    externalId: {
      type: String,
    },
    iban: {
      type: String,
    },
  },
  relations: {
    sessionId: {
      type: 'many-to-one',
      target: APP_MODULES.SESSIONS,
    },
  },
})

export default AccountsSchema
