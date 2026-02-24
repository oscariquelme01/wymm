import { TypeORMBaseRepository } from 'src/db/infrastructure/typeorm-base.repository'
import { APP_MODULES } from 'src/common/app-constants'
import { Token } from '../domain/token.entity'
import { TokensRepository } from '../domain/tokens.repository.interface'

export class TypeORMTokensRepository
  extends TypeORMBaseRepository<Token>
  implements TokensRepository
{
  protected module = APP_MODULES.TOKENS
}
