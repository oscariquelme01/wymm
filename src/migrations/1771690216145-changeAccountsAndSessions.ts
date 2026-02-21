import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAccountsAndSessions1771690216145 implements MigrationInterface {
    name = 'ChangeAccountsAndSessions1771690216145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "sessionId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_name_enum"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "name"`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_name_enum" AS ENUM('wants', 'needs', 'investments')`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "name" "public"."accounts_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "sessionId"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "expiresAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "value" character varying NOT NULL`);
    }

}
