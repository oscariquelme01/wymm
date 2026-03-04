import { Module, forwardRef } from '@nestjs/common'
import { ALERT_PROVIDER } from './domain/IAlert-provider.interface'
import { TelegramAlertProviderAdapter } from './infrastructure/telegram-alert-provider.adapter'
import { AlertService } from './application/alert.service'
import { HealthCheckCron } from './infrastructure/health-check.cron'
import { AccountsModule } from 'src/accounts/accounts.module'

@Module({
  imports: [forwardRef(() => AccountsModule)],
  providers: [
    {
      provide: ALERT_PROVIDER,
      useClass: TelegramAlertProviderAdapter,
    },
    AlertService,
    HealthCheckCron,
  ],
  exports: [AlertService],
})
export class AlertsModule {}
