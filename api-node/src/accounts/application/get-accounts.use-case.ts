import { Injectable, Inject } from '@nestjs/common'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../domain/accounts.repository.interface'

@Injectable()
export class GetAccountsUseCase {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute() {
    return await this.accountsRepository.find()
  }
}
