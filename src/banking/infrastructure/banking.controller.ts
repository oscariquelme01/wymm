import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import AddBankAccountUseCase from '../application/generate-auth-url.use-case'
import type { AddBankAccountDTO } from '../domain/IBanking-provider.interface'
import StartSessionUseCase from '../application/start-session.use-case'

@Controller('banking')
export class BankingController {
  constructor(
    private readonly addBankAccountUseCase: AddBankAccountUseCase,
    private readonly startSessionUseCase: StartSessionUseCase
  ) {}

  @Post('add-account')
  async addBankAccount(@Body() body: AddBankAccountDTO) {
    return await this.addBankAccountUseCase.execute(body)
  }

  @Get('add-account/callback')
  addBankAccountCallback(@Query('code') code: string) {
    this.startSessionUseCase.execute(code)
  }
}
