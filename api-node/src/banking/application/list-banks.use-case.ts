import { Injectable, Inject } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type IBankingProvider,
} from '../domain/IBanking-provider.interface'

@Injectable()
export default class ListBanksUseCase {
  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider
  ) {}

  async execute() {
    const availableBanks = await this.bankingProvider.listAvailableBanks()

    return availableBanks
  }
}
