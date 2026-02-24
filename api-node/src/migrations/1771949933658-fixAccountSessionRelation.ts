import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAccountSessionRelation1771949933658 implements MigrationInterface {
    name = 'FixAccountSessionRelation1771949933658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_67a623ec21cc851f7a9e38ef84d"`);
        await queryRunner.query(`ALTER TABLE "accounts" RENAME COLUMN "sessionIdId" TO "sessionId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "accountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_c9e9e141dd219e2c9da52e2b87c" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_c9e9e141dd219e2c9da52e2b87c"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "accountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accounts" RENAME COLUMN "sessionId" TO "sessionIdId"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_67a623ec21cc851f7a9e38ef84d" FOREIGN KEY ("sessionIdId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
