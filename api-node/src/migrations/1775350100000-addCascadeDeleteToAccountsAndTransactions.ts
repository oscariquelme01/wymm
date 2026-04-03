import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToAccountsAndTransactions1775350100000 implements MigrationInterface {
    name = 'AddCascadeDeleteToAccountsAndTransactions1775350100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // transactions.accountId → CASCADE
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_transactions_accountId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_89ecc60759c9b9fdd29bf27ae5b"`);
        const accountFk = await queryRunner.query(`
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'transactions' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name IN (
                SELECT constraint_name FROM information_schema.key_column_usage
                WHERE column_name = 'accountId' AND table_name = 'transactions'
            )
        `);
        for (const row of accountFk) {
            await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "${row.constraint_name}"`);
        }
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_accountId" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE`);

        // transactions.categorizationId → SET NULL
        const categorizationFk = await queryRunner.query(`
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'transactions' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name IN (
                SELECT constraint_name FROM information_schema.key_column_usage
                WHERE column_name = 'categorizationId' AND table_name = 'transactions'
            )
        `);
        for (const row of categorizationFk) {
            await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "${row.constraint_name}"`);
        }
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_categorizationId" FOREIGN KEY ("categorizationId") REFERENCES "transactionsCategorization"("id") ON DELETE SET NULL`);

        // transactionsCategorization.transactionId → CASCADE
        const transactionFk = await queryRunner.query(`
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'transactionsCategorization' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name IN (
                SELECT constraint_name FROM information_schema.key_column_usage
                WHERE column_name = 'transactionId' AND table_name = 'transactionsCategorization'
            )
        `);
        for (const row of transactionFk) {
            await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "${row.constraint_name}"`);
        }
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_transactionsCategorization_transactionId" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" DROP CONSTRAINT "FK_transactionsCategorization_transactionId"`);
        await queryRunner.query(`ALTER TABLE "transactionsCategorization" ADD CONSTRAINT "FK_transactionsCategorization_transactionId" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")`);

        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_categorizationId"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_categorizationId" FOREIGN KEY ("categorizationId") REFERENCES "transactionsCategorization"("id")`);

        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_accountId"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_accountId" FOREIGN KEY ("accountId") REFERENCES "accounts"("id")`);
    }
}
