import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import SyncAccountsUseCase from '../application/sync-accounts.use-case';
import { AlertService } from 'src/alerts/application/alert.service';

@Injectable()
export class SyncAccountsCron {
  public constructor(
    private readonly syncAccountUseCase: SyncAccountsUseCase,
    private readonly alertService: AlertService,
  ) {}

  private readonly logger = new Logger(SyncAccountsCron.name);

  @Cron(CronExpression.EVERY_12_HOURS)
  async syncAccounts() {
    this.logger.log('Syncing all accounts...');

    try {
      const result = await this.syncAccountUseCase.execute();
      this.logger.log('Done syncing all accounts');
      await this.alertService.sendSyncReport(result);
    } catch (error) {
      this.logger.error('Sync failed', error);
      await this.alertService.sendSyncReport({
        accountsSynced: 0,
        newTransactions: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }
}
