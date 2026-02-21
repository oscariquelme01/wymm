import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BankingModule } from './banking/banking.module'
import { DATABASE_CONFIG } from './db/infrastructure/typeorm-config'
import { TokensModule } from './tokens/tokens.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(DATABASE_CONFIG),
    BankingModule,
    TokensModule,
  ],
})
export class AppModule {}
