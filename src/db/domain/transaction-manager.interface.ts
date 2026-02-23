export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER')

export interface TransactionManager {
  start(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}
