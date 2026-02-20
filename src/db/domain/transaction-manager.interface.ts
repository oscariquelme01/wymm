export const TRANSACTION_MANAGER = Symbol('UNIT_OF_WORK')

export interface TransactionManager {
  start(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}
