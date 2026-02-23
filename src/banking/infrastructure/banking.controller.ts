import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import StartBankAuthUseCase from '../application/start-bank-auth.use-case'
import type { AddBankAccountDTO } from '../domain/IBanking-provider.interface'
import AuthorizeBankUseCase from '../application/authorize-bank.use-case'
import ListBanksUseCase from '../application/list-banks.use-case'
import GetSessionDataUseCase from '../application/get-session-data.use-case'

@Controller('banking')
export class BankingController {
  constructor(
    private readonly addBankAccountUseCase: StartBankAuthUseCase,
    private readonly startSessionUseCase: AuthorizeBankUseCase,
    private readonly listBanksUseCase: ListBanksUseCase,
    private readonly getSessionDataUseCase: GetSessionDataUseCase
  ) {}

  @Get('list-banks')
  async listBanks() {
    return await this.listBanksUseCase.execute()
  }

  @Post('add-account')
  async addBankAccount(@Body() body: AddBankAccountDTO) {
    return await this.addBankAccountUseCase.execute(body)
  }

  @Get('add-account/callback')
  addBankAccountCallback(@Query('code') code: string) {
    this.startSessionUseCase.execute(code)
  }

  @Get('session/:sessionId')
  async getSessionData(@Param('sessionId') sessionId: string) {
    return await this.getSessionDataUseCase.execute(sessionId)
  }
}
