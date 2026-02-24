import { Controller, Get, Param } from '@nestjs/common'
import ListBanksUseCase from '../application/list-banks.use-case'
import GetSessionDataUseCase from '../application/get-session-data.use-case'

@Controller('banking')
export class BankingController {
  constructor(
    private readonly listBanksUseCase: ListBanksUseCase,
    private readonly getSessionDataUseCase: GetSessionDataUseCase
  ) {}

  @Get('list-banks')
  async listBanks() {
    return await this.listBanksUseCase.execute()
  }

  @Get('session/:sessionId')
  async getSessionData(@Param('sessionId') sessionId: string) {
    return await this.getSessionDataUseCase.execute(sessionId)
  }
}
