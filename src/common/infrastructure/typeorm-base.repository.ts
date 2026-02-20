import {
  DataSource,
  DeepPartial as TypeORMDeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  Repository,
  ObjectLiteral,
} from 'typeorm';
import { APP_MODULE } from '../constants';
import {
  BaseRepository,
  DeepPartial,
  RepositoryCriteria,
  RepositoryDeleteResult,
  RepositoryFindOptions,
  RepositoryInsertResult,
  RepositoryUpdateResult,
} from '../domain/base.repository.interface';
import { txContext } from './typeorm-transaction-context';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeORMBaseRepository<T extends ObjectLiteral> implements BaseRepository<T> {
  protected readonly module: APP_MODULE;

  constructor(private readonly dataSource: DataSource) {}

  protected manager(): EntityManager {
    // try to get the manager from a running queryManager transaction from AsyncLocalStorage. Default to the datasource manager
    const queryRunner = txContext.getStore()

    return queryRunner ? queryRunner.manager : this.dataSource.manager;
  }

  protected repository(): Repository<T> {
    return this.manager().getRepository<T>(this.module);
  }

  public save(entity: DeepPartial<T>): Promise<T> {
    return this.repository().save(entity as TypeORMDeepPartial<T>);
  }

  public insert(entity: DeepPartial<T> | Array<DeepPartial<T>>): Promise<RepositoryInsertResult> {
    return this.repository().insert(entity as QueryDeepPartialEntity<T>) as Promise<RepositoryInsertResult>;
  }

  public find(options?: RepositoryFindOptions<T>): Promise<T[]> {
    return this.repository().find(options as FindManyOptions<T>);
  }

  public findOne(options: RepositoryFindOptions<T>): Promise<T | null> {
    return this.repository().findOne(options as FindOneOptions<T>);
  }

  public findBy(where: RepositoryCriteria<T>): Promise<T[]> {
    return this.repository().findBy(where as FindOptionsWhere<T>);
  }

  public findOneBy(where: RepositoryCriteria<T>): Promise<T | null> {
    return this.repository().findOneBy(where as FindOptionsWhere<T>);
  }

  public findAndCount(options?: RepositoryFindOptions<T>): Promise<[T[], number]> {
    return this.repository().findAndCount(options as FindManyOptions<T>);
  }

  public count(options?: RepositoryFindOptions<T>): Promise<number> {
    return this.repository().count(options as FindManyOptions<T>);
  }

  public countBy(where: RepositoryCriteria<T>): Promise<number> {
    return this.repository().countBy(where as FindOptionsWhere<T>);
  }

  public update(
    criteria: RepositoryCriteria<T>,
    partialEntity: DeepPartial<T>,
  ): Promise<RepositoryUpdateResult> {
    return this.repository().update(
      criteria as FindOptionsWhere<T>,
      partialEntity as QueryDeepPartialEntity<T>,
    ) as Promise<RepositoryUpdateResult>;
  }

  public delete(criteria: RepositoryCriteria<T>): Promise<RepositoryDeleteResult> {
    return this.repository().delete(criteria as FindOptionsWhere<T>) as Promise<RepositoryDeleteResult>;
  }

  public remove(entity: T[]): Promise<T | T[]> {
    return this.repository().remove(entity);
  }
}
