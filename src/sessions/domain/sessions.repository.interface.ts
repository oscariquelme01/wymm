import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Session } from './session.entity'

export const SESSIONS_REPOSITORY = 'SESSIONS_REPOSITORY'
export interface SessionsRepository extends BaseRepository<Session> {}
