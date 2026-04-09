import { Injectable, Inject } from '@nestjs/common'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../domain/accounts.repository.interface'
import { AccountTypes } from '../domain/account.entity'

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute(id: string, updates: { name?: string; type?: AccountTypes; institution?: string }) {
    await this.accountsRepository.update({ id }, updates)
    return await this.accountsRepository.findOneBy({ id })
  }
}
