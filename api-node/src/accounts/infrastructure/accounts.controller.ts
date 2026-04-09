import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import SyncAccountsUseCase from '../application/sync-accounts.use-case'
import { GetAccountsUseCase } from '../application/get-accounts.use-case'
import { DeleteAccountUseCase } from '../application/delete-account.use-case'
import { UpdateAccountUseCase } from '../application/update-account.use-case'
import { AccountTypes } from '../domain/account.entity'

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly syncAccountsUseCase: SyncAccountsUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase
  ) {}

  @Get()
  async getAccounts() {
    return await this.getAccountsUseCase.execute()
  }

  @Post('sync-accounts')
  async syncAccounts() {
    return await this.syncAccountsUseCase.execute(true)
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') id: string,
    @Body() updates: { name?: string; type?: AccountTypes; institution?: string }
  ) {
    return await this.updateAccountUseCase.execute(id, updates)
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    return await this.deleteAccountUseCase.execute(id)
  }
}
