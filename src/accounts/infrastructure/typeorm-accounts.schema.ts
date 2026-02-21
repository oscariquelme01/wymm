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
      type: 'enum',
      enum: AccountTypes,
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
      type: Number,
    },
    externalId: {
      type: String,
    },
    iban: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    value: {
      type: String,
    },
  },
})

export default AccountsSchema
