import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import StartBankAuthUseCase from '../application/start-bank-auth.use-case'
import type { AddBankAccountDTO } from '../domain/IBanking-provider.interface'
import AuthorizeBankUseCase from '../application/authorize-bank.use-case'
import ListBanksUseCase from '../application/list-banks.use-case'

@Controller('banking')
export class BankingController {
  constructor(
    private readonly addBankAccountUseCase: StartBankAuthUseCase,
    private readonly startSessionUseCase: AuthorizeBankUseCase,
    private readonly listBanksUseCase: ListBanksUseCase
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
}
