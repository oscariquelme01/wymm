import { AsyncLocalStorage } from 'async_hooks'
import { QueryRunner } from 'typeorm'

export const txContext = new AsyncLocalStorage<QueryRunner | null>()
