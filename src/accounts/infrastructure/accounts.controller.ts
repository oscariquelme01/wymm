import { Controller, Get, Post } from '@nestjs/common'
import SyncAccountsUseCase from '../application/sync-accounts.use-case'

@Controller('accounts')
export class AccountsController {
  constructor (private readonly syncAccountsUseCase: SyncAccountsUseCase) {}

  @Post('sync-accounts')
  async syncAccounts() {
    return await this.syncAccountsUseCase.execute()
  }
}
