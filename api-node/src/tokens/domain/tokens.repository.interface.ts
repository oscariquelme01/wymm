import { BaseRepository } from 'src/db/domain/base.repository.interface'
import { Token } from './token.entity'

export const TOKENS_REPOSITORY = 'TOKENS_REPOSITORY'
export interface TokensRepository extends BaseRepository<Token> {}
