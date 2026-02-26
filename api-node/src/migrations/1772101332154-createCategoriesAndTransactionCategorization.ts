import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriesAndTransactionCategorization1772101332154 implements MigrationInterface {
    name = 'CreateCategoriesAndTransactionCategorization1772101332154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactionsCategorization_source_enum" AS ENUM('user_overrides', 'ml_model')`);
        await queryRunner.query(`CREATE TABLE "transactionsCategorization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer, "source" "public"."transactionsCategorization_source_enum" NOT NULL, "confidence" numeric, "transactionId" uuid, "categoryId" uuid, CONSTRAINT "REL_a29bf594ebe0eb039347bdcaed" UNIQUE ("transactionId"), CONSTRAINT "REL_421acfccf56aed585e34c1db01" UNIQUE ("categoryId"), CONSTRAINT "PK_9713c742e0f5670d169c4b9e004" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer, "name" character varying NOT NULL, "parentId" character varying, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "categorizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_a91ae289ccd6c2f49d3d9961524" UNIQUE ("categorizationId")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a91ae289ccd6c2f49d3d9961524" FOREIGN KEY ("categorizationId") REFERENCES "transactionsCategorization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_a29bf594ebe0eb039347bdcaed2" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_421acfccf56aed585e34c1db017" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "FK_421acfccf56aed585e34c1db017"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "FK_a29bf594ebe0eb039347bdcaed2"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a91ae289ccd6c2f49d3d9961524"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_a91ae289ccd6c2f49d3d9961524"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "categorizationId"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "transactionsCategorization"`);
        await queryRunner.query(`DROP TYPE "public"."transactionsCategorization_source_enum"`);
    }

}
