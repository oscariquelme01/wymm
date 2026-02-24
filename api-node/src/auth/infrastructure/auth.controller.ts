import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common'
import StartBankAuthUseCase from '../../auth/application/start-bank-auth.use-case'
import type { AddBankAccountDTO } from 'src/banking/domain/IBanking-provider.interface'
import AuthorizeBankUseCase from '../../auth/application/authorize-bank.use-case'
import { env } from 'src/config/env'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly startBankAuthUseCase: StartBankAuthUseCase,
    private readonly authorizeBankUseCase: AuthorizeBankUseCase,
  ) {}

  @Post('connect-account')
  async connectBankAccount(@Body() body: AddBankAccountDTO) {
    return await this.startBankAuthUseCase.execute(body)
  }

  @Get('connect-account/callback')
  async connectBankAccountCallback(@Query('code') code: string, @Res() res) {
    await this.authorizeBankUseCase.execute(code)
    return res.redirect(env.frontend.url)
  }
}
