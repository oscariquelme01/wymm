import { Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from '../domain/IBanking-provider.interface'
import {
  TOKENS_REPOSITORY,
  type TokensRepository,
} from 'src/tokens/domain/tokens.repository.interface'
import { TokenTypes } from 'src/tokens/domain/token.entity'

export default class StartSessionUseCase {
  private readonly logger = new Logger(StartSessionUseCase.name)

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(TOKENS_REPOSITORY)
    private readonly tokensRepository: TokensRepository
  ) {}

  async execute(code: string) {
    this.logger.log(`Authorizasing session with code ${code}`)
    const sessionData = await this.bankingProvider.startSession(code)

    this.logger.debug(
      `Saving sessionId ${sessionData.sessionId} to DB. Session expires in ${sessionData.validUntil}`
    )
    this.tokensRepository.save({
      value: sessionData.sessionId,
      type: TokenTypes.SESSION_TOKEN,
      expiresAt: sessionData.validUntil,
    })
  }
}
