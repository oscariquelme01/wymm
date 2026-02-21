import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Session } from '../domain/session.entity'
import { SessionsRepository } from '../domain/sessions.repository.interface'

export class TypeORMSessionsRepository
  extends TypeORMBaseRepository<Session>
  implements SessionsRepository
{
  protected readonly module = APP_MODULES.SESSIONS
}
