import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import SyncAccountsUseCase from '../application/sync-accounts.use-case';

@Injectable()
export class SyncAccountsCron {
  public constructor(
    private readonly syncAccountUseCase: SyncAccountsUseCase,
  ) {}

  private readonly logger = new Logger(SyncAccountsCron.name);

  @Cron(CronExpression.EVERY_12_HOURS)
  async syncAccounts() {
    this.logger.log('Syncing all accounts...');
    await this.syncAccountUseCase.execute();
    this.logger.log('Done syncing all accounts');
  }
}
