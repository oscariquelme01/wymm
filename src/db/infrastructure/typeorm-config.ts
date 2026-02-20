import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { join } from 'path'
import { env } from 'src/config/env'
import { DataSourceOptions } from 'typeorm'

export const DATABASE_CONFIG: TypeOrmModuleOptions = {
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  autoLoadEntities: true,
  synchronize: false,
  retryAttempts: 10,
  retryDelay: 3000,
  extra: {
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  },
}

export const DATASOURCE_CONFIG: DataSourceOptions = {
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.nodeEnv === 'development',
  logging: true,
  // Needed to anchor the search to project root
  entities: [join(__dirname, '..', '..', 'src/**/*.schema{.ts,.js}')],
  migrations: [join(__dirname, '..', '..', 'src/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
}
