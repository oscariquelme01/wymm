import { EntitySchema } from 'typeorm'
import { Token, TokenTypes } from '../domain/token.entity'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'

const TokensSchema = new EntitySchema<Token>({
  name: APP_MODULES.TOKENS,
  tableName: APP_MODULES.TOKENS,
  columns: {
    ...BaseSchema,
    expiresAt: {
      type: Date,
    },
    type: {
      type: 'enum',
      enum: TokenTypes,
    },
    value: {
      type: String
    }
  },
  // TODO: implement accounts
  // relations: {
  //   accountId: {
  //     type: 'many-to-one',
  //     target: APP_MODULES.ACCOUNTS,
  //   },
  // },
})

export default TokensSchema
