import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from 'src/config/env';

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
};
