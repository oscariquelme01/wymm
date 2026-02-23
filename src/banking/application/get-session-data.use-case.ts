import { Injectable, Inject } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
  type SessionData,
} from '../domain/IBanking-provider.interface'

@Injectable()
export default class GetSessionDataUseCase {
  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider
  ) {}

  async execute(sessionId: string): Promise<SessionData> {
    return await this.bankingProvider.getSessionData(sessionId)
  }
}
