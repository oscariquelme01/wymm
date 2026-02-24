import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeORMTokensRepository } from './infrastructure/typeorm-tokens.repository'
import TokensSchema from './infrastructure/typeorm-tokens.schema'

import { TOKENS_REPOSITORY } from './domain/tokens.repository.interface'

@Module({
  imports: [TypeOrmModule.forFeature([TokensSchema])],
  providers: [
    {
      provide: TOKENS_REPOSITORY,
      useClass: TypeORMTokensRepository,
    },
  ],
  exports: [TOKENS_REPOSITORY],
})
export class TokensModule {}
