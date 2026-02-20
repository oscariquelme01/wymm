import { EntitySchemaColumnOptions } from 'typeorm';

const BaseSchema = {
  id: {
    type: 'uuid',
    primary: true,
    generated: 'uuid',
  } as EntitySchemaColumnOptions,

  createdAt: {
    type: Date,
    createDate: true,
  } as EntitySchemaColumnOptions,

  updatedAt: {
    type: Date,
    updateDate: true,
  } as EntitySchemaColumnOptions,

  deletedAt: {
    deleteDate: true,
    type: Date,
  } as EntitySchemaColumnOptions,

  version: {
    type: Number,
    version: true,
    nullable: true,
  } as EntitySchemaColumnOptions,
};
export default BaseSchema;
