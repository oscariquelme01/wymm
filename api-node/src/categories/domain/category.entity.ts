import BaseModel from 'src/db/domain/base.entity'

export interface Category extends BaseModel {
  name: string,
  parentId: string | null
}

export enum ConfidenceLevels {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const CATEGORIES_QUEUE = 'categories_classification_queue'
