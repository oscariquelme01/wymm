import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  BANKING_PROVIDER,
  type AddBankAccountDTO,
  type IBankingProvider,
} from 'src/banking/domain/IBanking-provider.interface'

@Injectable()
export default class StartBankAuthUseCase {
  private readonly logger = new Logger(StartBankAuthUseCase.name)

  constructor(
    @Inject(BANKING_PROVIDER)
    private readonly bankingProvider: IBankingProvider
  ) {}

  async execute(dto: AddBankAccountDTO) {
    this.logger.log(
      `Generating URL for bank ${dto.institutionId} with country code ${dto.country}`
    )
    const url = await this.bankingProvider.startBankAuth(
      dto.institutionId,
      dto.country
    )
    this.logger.log(`Generated url: ${url}`)

    return url
  }
}
