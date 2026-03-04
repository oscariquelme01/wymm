export const ALERT_PROVIDER = 'ALERT_PROVIDER'

export interface IAlertProvider {
  sendMessage(message: string): Promise<void>
}
