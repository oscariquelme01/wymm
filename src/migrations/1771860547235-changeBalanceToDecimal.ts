import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeBalanceToDecimal1771860547235 implements MigrationInterface {
    name = 'ChangeBalanceToDecimal1771860547235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "balance" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "balance" integer NOT NULL`);
    }

}
