import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import StartBankAuthUseCase from '../../auth/application/start-bank-auth.use-case'
import type { AddBankAccountDTO } from 'src/banking/domain/IBanking-provider.interface'
import AuthorizeBankUseCase from '../../auth/application/authorize-bank.use-case'

@Controller('auth')
export class BankingController {
  constructor(
    private readonly startBankAuthUseCase: StartBankAuthUseCase,
    private readonly authorizeBankUseCase: AuthorizeBankUseCase,
  ) {}

  @Post('connect-account')
  async connectBankAccount(@Body() body: AddBankAccountDTO) {
    return await this.startBankAuthUseCase.execute(body)
  }

  @Get('connect-account/callback')
  connectBankAccountCallback(@Query('code') code: string) {
    this.authorizeBankUseCase.execute(code)
  }
}
