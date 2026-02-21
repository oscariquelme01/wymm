import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMSessionsRepository } from './infrastructure/typeorm-sessions.repository'
import SessionsSchema from './infrastructure/typeorm-sessions.schema'

import { SESSIONS_REPOSITORY } from './domain/sessions.repository.interface'

@Module({
  imports: [TypeOrmModule.forFeature([SessionsSchema])],
  providers: [
    {
      provide: SESSIONS_REPOSITORY,
      useClass: TypeORMSessionsRepository,
    },
  ],
  exports: [SESSIONS_REPOSITORY],
})
export class SessionsModule {}
