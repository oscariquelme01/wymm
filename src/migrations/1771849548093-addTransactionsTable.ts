import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionsTable1771849548093 implements MigrationInterface {
    name = 'AddTransactionsTable1771849548093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('EXPENSE', 'INCOME', 'TRANSFER')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer, "amount" numeric NOT NULL, "currency" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "description" character varying NOT NULL, "externalId" character varying NOT NULL, "creditorName" character varying, "debtorName" character varying, "accountIdId" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e515179866837119c3f9a743d3f" FOREIGN KEY ("accountIdId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e515179866837119c3f9a743d3f"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    }

}
