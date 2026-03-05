import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReasoningToTransactionCategorization1772731389465 implements MigrationInterface {
    name = 'AddReasoningToTransactionCategorization1772731389465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD "reasoning" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP COLUMN "reasoning"`);
    }

}
