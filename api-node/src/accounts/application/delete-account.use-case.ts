import { Injectable, Inject } from '@nestjs/common'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../domain/accounts.repository.interface'

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository
  ) {}

  async execute(id: string) {
    return await this.accountsRepository.delete({ id })
  }
}
