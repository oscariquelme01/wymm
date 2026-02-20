import { Body, Controller, Post } from '@nestjs/common'
import AddBankAccountUseCase from '../application/generate-auth-url.use-case'
import type { GenerateAuthUrlDTO } from '../domain/IBanking-provider.interface'

@Controller('banking')
export class BankingController {
  constructor(private readonly addBankAccountUseCase: AddBankAccountUseCase) {}

  @Post('add-account')
  addBankAccount(@Body() body: GenerateAuthUrlDTO) {
    return this.addBankAccountUseCase.execute(body)
  }
}
