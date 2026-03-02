import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTransactionCategorizationConfidenceType1772438995090 implements MigrationInterface {
    name = 'FixTransactionCategorizationConfidenceType1772438995090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP COLUMN "confidence"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD "confidence" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP COLUMN "confidence"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD "confidence" numeric`);
    }

}
