import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  ALERT_PROVIDER,
  type IAlertProvider,
} from '../domain/IAlert-provider.interface'
import { type Account } from 'src/accounts/domain/account.entity'

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name)

  constructor(
    @Inject(ALERT_PROVIDER)
    private readonly alertProvider: IAlertProvider,
  ) {}

  async sendHealthCheck(accounts: Array<Account & { session: { expiresAt: Date } }>): Promise<void> {
    const now = new Date()

    const lines = accounts.map((account) => {
      const expiresAt = new Date(account.session.expiresAt)
      const diffMs = expiresAt.getTime() - now.getTime()
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      let status: string
      if (daysLeft <= 0) {
        status = '🔴 EXPIRED'
      } else if (daysLeft <= 7) {
        status = `🟡 ${daysLeft}d left`
      } else {
        status = `🟢 ${daysLeft}d left`
      }

      return `• <b>${account.name}</b> (${account.institution}) — ${status}`
    })

    const message = [
      '📊 <b>WIMM Daily Health Check</b>',
      '',
      `Accounts: ${accounts.length}`,
      '',
      ...lines,
      '',
      `Checked at ${now.toISOString().split('T')[0]}`,
    ].join('\n')

    this.logger.log('Sending daily health check alert')
    await this.alertProvider.sendMessage(message)
  }

  async sendSyncReport(results: {
    accountsSynced: number
    newTransactions: number
    errors: string[]
  }): Promise<void> {
    const hasErrors = results.errors.length > 0

    const lines: string[] = [
      `🔄 <b>WIMM Sync Complete</b>`,
      '',
      `Accounts synced: ${results.accountsSynced}`,
      `New transactions: ${results.newTransactions}`,
    ]

    if (hasErrors) {
      lines.push('')
      lines.push(`⚠️ Errors (${results.errors.length}):`)
      for (const error of results.errors) {
        lines.push(`• ${error}`)
      }
    } else {
      lines.push('')
      lines.push('✅ No errors')
    }

    this.logger.log('Sending sync report alert')
    await this.alertProvider.sendMessage(lines.join('\n'))
  }
}
