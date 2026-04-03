import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransferGroupIdToTransactions1775350000000 implements MigrationInterface {
    name = 'AddTransferGroupIdToTransactions1775350000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transferGroupId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transferGroupId"`);
    }

}
