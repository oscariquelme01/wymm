import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountsTable1771686991325 implements MigrationInterface {
    name = 'AddAccountsTable1771686991325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."accounts_name_enum" AS ENUM('wants', 'needs', 'investments')`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_type_enum" AS ENUM('wants', 'needs', 'investments')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer, "name" "public"."accounts_name_enum" NOT NULL, "currency" character varying NOT NULL, "type" "public"."accounts_type_enum" NOT NULL, "institution" character varying NOT NULL, "balance" integer NOT NULL, "externalId" character varying NOT NULL, "iban" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_name_enum"`);
    }

}
