import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type GenerateAuthUrlDTO,
  type IBankingProvider,
} from '../domain/IBanking-provider.interface'
import { env } from 'src/config/env'

@Injectable()
export default class AddBankAccountUseCase {
  private readonly logger = new Logger(AddBankAccountUseCase.name);

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider
  ) {}

  execute(dto: GenerateAuthUrlDTO) {
    return this.generateAuthUrl(dto)
  }

  mapDTOtoEnableBanking(dto: GenerateAuthUrlDTO) {
    return {
      aspsp: {
        name: dto.institutionId,
        country: dto.country,
      },
      psu_types: ['personal'], //TODO: do not hardcode this!
      access: {
        balances: true,
        transactions: true,
        valid_until: '2026-07-18T14:15:22Z', //TODO: and this!!
      },
      state: crypto.randomUUID(),
      redirect_url: env.enableBanking.redirectURL,
    }
  }

  async generateAuthUrl(dto: GenerateAuthUrlDTO) {
    this.logger.log(`Generating URL for bank ${dto.institutionId} with country code ${dto.country}`)
    const body = this.mapDTOtoEnableBanking(dto)

    const response = await this.bankingProvider.makeRequest<{
      url: string
      authorization_id: string
      psu_id_hash: string
      state?: string
    }>('/auth', 'POST', body)

    this.logger.log(`Generated url: ${response.url}`)

    return response.url
  }
}
