import { Injectable, Logger } from '@nestjs/common'
import { env } from 'src/config/env'
import { type IAlertProvider } from '../domain/IAlert-provider.interface'

@Injectable()
export class TelegramAlertProviderAdapter implements IAlertProvider {
  private readonly logger = new Logger(TelegramAlertProviderAdapter.name)
  private readonly botToken = env.telegram.botToken
  private readonly chatId = env.telegram.chatId

  async sendMessage(message: string): Promise<void> {
    if (!env.telegram.enabled) {
      this.logger.warn('Telegram alerts disabled — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
      return
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        this.logger.error(`Telegram API error ${response.status}: ${body}`)
      }
    } catch (error) {
      this.logger.error('Failed to send Telegram alert', error)
    }
  }
}
