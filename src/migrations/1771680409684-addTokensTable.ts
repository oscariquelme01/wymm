import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTokensTable1771680409684 implements MigrationInterface {
  name = 'AddTokensTable1771680409684'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_type_enum" AS ENUM('apiToken', 'sessionToken')`
    )
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer, "expiresAt" TIMESTAMP NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tokens"`)
    await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`)
  }
}
