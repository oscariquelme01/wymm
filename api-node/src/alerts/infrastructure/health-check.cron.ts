import { Injectable, Inject, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from 'src/accounts/domain/accounts.repository.interface'
import { AlertService } from '../application/alert.service'

@Injectable()
export class HealthCheckCron {
  private readonly logger = new Logger(HealthCheckCron.name)

  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    private readonly alertService: AlertService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async healthCheck() {
    this.logger.log('Running daily health check...')

    try {
      const accounts = await this.accountsRepository.find({
        relations: ['session'],
      })

      await this.alertService.sendHealthCheck(accounts as any)
      this.logger.log('Health check alert sent')
    } catch (error) {
      this.logger.error('Failed to send health check alert', error)
    }
  }
}
