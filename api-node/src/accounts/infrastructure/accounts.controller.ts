import { Controller, Get, Post } from '@nestjs/common'
import SyncAccountsUseCase from '../application/sync-accounts.use-case'
import { GetAccountsUseCase } from '../application/get-accounts.use-case'

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly syncAccountsUseCase: SyncAccountsUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase
  ) {}

  @Get()
  async getAccounts() {
    return await this.getAccountsUseCase.execute()
  }

  @Post('sync-accounts')
  async syncAccounts() {
    return await this.syncAccountsUseCase.execute()
  }
}
