import { DataSource } from 'typeorm';
import { env } from 'src/config/env';
import { DataSourceOptions } from 'typeorm/browser';

export const DATASOURCE_CONFIG: DataSourceOptions = {
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  synchronize: false,
  logging: true,
  entities: ['src/**/*.schema.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

export default new DataSource(DATASOURCE_CONFIG);
