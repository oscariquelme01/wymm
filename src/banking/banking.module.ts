import { Module } from '@nestjs/common';
import AddBankAccountUseCase from './application/generate-auth-url.use-case';
import { EnableBankingBankingProviderAdapter } from './infrastructure/enable-banking-banking-provider.adapter';
import { BankingController } from './infrastructure/banking.controller';
import { BANKING_PROVIDER } from './domain/IBanking-provider.interface';

@Module({
  controllers: [BankingController],
  providers: [
    {
      provide: BANKING_PROVIDER,
      useClass: EnableBankingBankingProviderAdapter,
    },
    AddBankAccountUseCase,
  ],
})
export class BankingModule {}
