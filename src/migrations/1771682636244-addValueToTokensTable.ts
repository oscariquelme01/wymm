import { MigrationInterface, QueryRunner } from "typeorm";

export class AddValueToTokensTable1771682636244 implements MigrationInterface {
    name = 'AddValueToTokensTable1771682636244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" ADD "value" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "value"`);
    }

}
