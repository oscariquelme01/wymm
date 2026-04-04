import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { TransactionManager } from '../domain/transaction-manager.interface'
import { DataSource, QueryRunner } from 'typeorm'
import { txContext } from './typeorm-transaction-context'
import { InternalStateException } from 'src/common/exceptions/domain-exceptions'

@Injectable()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  private readonly logger = new Logger(TypeOrmTransactionManager.name)
  private queryRunner: QueryRunner | null = null

  async start(): Promise<void> {
    this.logger.log('Starting transaction...')
    if (this.queryRunner) {
      throw new ConflictException('Transaction already started')
    }

    this.queryRunner = this.dataSource.createQueryRunner()
    await this.queryRunner.connect()
    await this.queryRunner.startTransaction()

    this.logger.log(`Transaction started`)
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.queryRunner) {
      throw new InternalStateException(
        'No active transaction found. Call start() first'
      )
    }

    return txContext.run(this.queryRunner, fn)
  }

  async commit(): Promise<void> {
    if (!this.queryRunner) {
      throw new InternalStateException(
        'No active transaction found in context'
      )
    }

    try {
      await this.queryRunner.commitTransaction()
      this.logger.log('Transaction committed successfully')
    } catch (e) {
      this.logger.error(`Failed to commit transaction: ${e}`)
      throw e
    } finally {
      await this.queryRunner.release()
      this.queryRunner = null
    }
  }

  async rollback(): Promise<void> {
    if (!this.queryRunner) {
      throw new InternalStateException(
        'No active transaction found in context'
      )
    }

    try {
      await this.queryRunner.rollbackTransaction()
      this.logger.log('Transaction rolled back successfully')
    } catch (e) {
      this.logger.error(`Failed to rollback transaction: ${e}`)
      throw e
    } finally {
      await this.queryRunner.release()
      this.queryRunner = null
    }
  }
}
