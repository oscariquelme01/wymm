import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Session } from './session.entity'

export interface SessionsRepository extends BaseRepository<Session> {}
