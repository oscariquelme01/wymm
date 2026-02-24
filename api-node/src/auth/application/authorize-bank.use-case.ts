import { Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from '../../banking/domain/IBanking-provider.interface'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from 'src/accounts/domain/accounts.repository.interface'
import {
  SESSIONS_REPOSITORY,
  type SessionsRepository,
} from 'src/sessions/domain/sessions.repository.interface'
import { AccountTypes } from 'src/accounts/domain/account.entity'

export default class AuthorizeBankUseCase {
  private readonly logger = new Logger(AuthorizeBankUseCase.name)

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(code: string) {
    this.logger.log(`Authorizasing session with code ${code}`)
    const sessionData = await this.bankingProvider.authorizeSession(code)

    this.logger.debug(
      `Saving sessionId ${sessionData.sessionId} to DB. Session expires in ${sessionData.validUntil}`
    )
    const sessionEntry = await this.sessionsRepository.save({
      sessionId: sessionData.sessionId,
      expiresAt: sessionData.validUntil,
    })

    for (const accountData of sessionData.accountsData) {
      this.logger.debug(`Processing account with external id ${accountData.id}`)

      // search by iban cause external id changes based on session
      const existingAccount = await this.accountsRepository.findOneBy({
        iban: accountData.iban,
      })

      if (existingAccount) {
        this.logger.debug(
          `Account exists (id: ${existingAccount.id}). Updating session linkage.`
        )

        await this.accountsRepository.save({
          ...existingAccount,
          name: accountData.name,
          currency: 'EUR',
          iban: accountData.iban,
          institution: accountData.institution,
          session: { id: sessionEntry.id }
        })
      } else {
        this.logger.debug(`Account does not exist. Creating new account.`)

        await this.accountsRepository.save({
          name: accountData.name,
          currency: 'EUR',
          externalId: accountData.id,
          balance: 0,
          type: AccountTypes.NEEDS, // TODO: change this!!
          iban: accountData.iban,
          institution: accountData.institution,
          session: { id: sessionEntry.id },
        })
      }
    }
  }
}
