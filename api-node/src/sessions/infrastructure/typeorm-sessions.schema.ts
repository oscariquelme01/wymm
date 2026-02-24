import { EntitySchema } from 'typeorm'
import { Session } from '../domain/session.entity'
import { APP_MODULES } from 'src/common/app-constants'
import BaseSchema from 'src/db/infrastructure/typeorm-base.schema'

const SessionsSchema = new EntitySchema<Session>({
  name: APP_MODULES.SESSIONS,
  tableName: APP_MODULES.SESSIONS,
  columns: {
    ...BaseSchema,
    expiresAt: {
      type: Date,
    },
    sessionId: {
      type: String
    }
  },
  relations: {
    accountId: {
      type: 'one-to-many',
      target: APP_MODULES.ACCOUNTS,
    },
  },
})

export default SessionsSchema
