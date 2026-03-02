import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTransactionCategorizationRelation1772439540083 implements MigrationInterface {
    name = 'FixTransactionCategorizationRelation1772439540083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "FK_421acfccf56aed585e34c1db017"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "REL_421acfccf56aed585e34c1db01"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_421acfccf56aed585e34c1db017" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "FK_421acfccf56aed585e34c1db017"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "REL_421acfccf56aed585e34c1db01" UNIQUE ("categoryId")`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_421acfccf56aed585e34c1db017" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
