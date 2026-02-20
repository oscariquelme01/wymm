import { Injectable, Logger } from '@nestjs/common';
import { TransactionManager } from '../domain/transaction-manager.interface';
import { DataSource } from 'typeorm';
import { txContext } from './typeorm-transaction-context';

@Injectable()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  private readonly logger = new Logger(TypeOrmTransactionManager.name);

  async start(): Promise<void> {
    this.logger.log('Starting transaction...');
    if (txContext.getStore()) {
      throw new Error('Transaction already started');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    txContext.enterWith(queryRunner);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.logger.log(`Transaction started`);
  }

  async commit(): Promise<void> {
    const queryRunner = txContext.getStore();

    if (!queryRunner) {
      throw new Error('No active transaction found in context');
    }

    try {
      await queryRunner.commitTransaction();
      this.logger.log('Transaction committed successfully');
    } catch (e) {
      this.logger.error(`Failed to commit transaction: ${e}`);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async rollback(): Promise<void> {
    const queryRunner = txContext.getStore();

    if (!queryRunner) {
      throw new Error('No active transaction found in context');
    }

    try {
      await queryRunner.rollbackTransaction();
      this.logger.log('Transaction rolled back successfully');
    } catch (e) {
      this.logger.error(`Failed to rollback transaction: ${e}`);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
