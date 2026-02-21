import { Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from '../domain/IBanking-provider.interface'
import { ACCOUNTS_REPOSITORY, type AccountsRepository } from 'src/accounts/domain/accounts.repository.interface'
import { SESSIONS_REPOSITORY, type SessionsRepository } from 'src/sessions/domain/sessions.repository.interface'
import { AccountTypes } from 'src/accounts/domain/account.entity'

export default class AuthorizeBankUseCase {
  private readonly logger = new Logger(AuthorizeBankUseCase.name)

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async execute(code: string) {
    this.logger.log(`Authorizasing session with code ${code}`)
    const sessionData = await this.bankingProvider.authorizeSession(code)

    this.logger.debug(
      `Saving sessionId ${sessionData.sessionId} to DB. Session expires in ${sessionData.validUntil}`
    )
    const sessionEntry = await this.sessionsRepository.save({
      sessionId: sessionData.sessionId,
      expiresAt: sessionData.validUntil
    })

    for (const accountData of sessionData.accountsData) {
      this.logger.debug(`Saving account with id ${accountData.id}`)
      await this.accountsRepository.save({
        name: accountData.name,
        currency: 'EUR', // might have to change this in the future
        externalId: accountData.id,
        balance: 0, // TODO, change this
        type: AccountTypes.NEEDS, // TODO, change this
        iban: accountData.iban,
        institution: accountData.institution,
        sessionsId: sessionEntry.id
      })
    }

  }
}
