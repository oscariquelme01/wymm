import { TypeORMBaseRepository } from 'src/src/common/infrastructure/typeorm-base.repository';
import { Session } from '../domain/session.entity';
import { SessionsRepository } from '../domain/sessions.repository.interface';

export class TypeORMSessionsRepository
  extends TypeORMBaseRepository<Session>
  implements SessionsRepository {}
