import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BankingModule } from './banking/banking.module';
import { DATABASE_CONFIG } from 'co';

@Module({
  imports: [BankingModule, TypeOrmModule.forRoot(DATABASE_CONFIG)],
})
export class AppModule {}
