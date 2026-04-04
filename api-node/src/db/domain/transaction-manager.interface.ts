export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER')

export interface TransactionManager {
  start(): Promise<void>
  run<T>(fn: () => Promise<T>): Promise<T>
  commit(): Promise<void>
  rollback(): Promise<void>
}
