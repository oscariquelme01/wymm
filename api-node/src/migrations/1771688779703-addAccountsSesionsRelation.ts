import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountsSesionsRelation1771688779703 implements MigrationInterface {
    name = 'AddAccountsSesionsRelation1771688779703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "sessionIdId" uuid`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_67a623ec21cc851f7a9e38ef84d" FOREIGN KEY ("sessionIdId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_67a623ec21cc851f7a9e38ef84d"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "sessionIdId"`);
    }

}
