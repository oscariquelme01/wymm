// this feels like sorcery, mainly because it is
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P]
}

export type RepositoryCriteria<T> = DeepPartial<T> | Array<DeepPartial<T>>

export type RepositoryFindOptions<T> = {
  where?: RepositoryCriteria<T>
  order?: DeepPartial<Record<keyof T, 'ASC' | 'DESC'>>
  relations?: string[]
  skip?: number
  take?: number
}

export type RepositoryInsertResult = {
  identifiers?: Array<Record<string, unknown>>
}

export type RepositoryUpdateResult = {
  affected?: number
}

export type RepositoryDeleteResult = {
  affected?: number
}

export interface BaseRepository<T> {
  save(entity: DeepPartial<T>): Promise<T>
  insert(
    entity: DeepPartial<T> | Array<DeepPartial<T>>
  ): Promise<RepositoryInsertResult>
  find(options?: RepositoryFindOptions<T>): Promise<T[]>
  findOne(options: RepositoryFindOptions<T>): Promise<T | null>
  findBy(where: RepositoryCriteria<T>): Promise<T[]>
  findOneBy(where: RepositoryCriteria<T>): Promise<T | null>
  findAndCount(options?: RepositoryFindOptions<T>): Promise<[T[], number]>
  count(options?: RepositoryFindOptions<T>): Promise<number>
  countBy(where: RepositoryCriteria<T>): Promise<number>
  update(
    criteria: RepositoryCriteria<T>,
    partialEntity: DeepPartial<T>
  ): Promise<RepositoryUpdateResult>
  delete(criteria: RepositoryCriteria<T>): Promise<RepositoryDeleteResult>
  remove(entity: T | T[]): Promise<T | T[]>
}
