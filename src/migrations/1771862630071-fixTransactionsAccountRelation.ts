import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTransactionsAccountRelation1771862630071 implements MigrationInterface {
    name = 'FixTransactionsAccountRelation1771862630071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e515179866837119c3f9a743d3f"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "accountIdId" TO "accountId"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "accountId" TO "accountIdId"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e515179866837119c3f9a743d3f" FOREIGN KEY ("accountIdId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
