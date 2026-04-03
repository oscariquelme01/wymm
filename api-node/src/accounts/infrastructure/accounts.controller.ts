import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import SyncAccountsUseCase from '../application/sync-accounts.use-case'
import { GetAccountsUseCase } from '../application/get-accounts.use-case'
import { DeleteAccountUseCase } from '../application/delete-account.use-case'

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly syncAccountsUseCase: SyncAccountsUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase
  ) {}

  @Get()
  async getAccounts() {
    return await this.getAccountsUseCase.execute()
  }

  @Post('sync-accounts')
  async syncAccounts() {
    return await this.syncAccountsUseCase.execute(true)
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    return await this.deleteAccountUseCase.execute(id)
  }
}
