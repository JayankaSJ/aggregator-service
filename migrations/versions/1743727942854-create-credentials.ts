import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCredential1743727942854 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "credentials" (
        "id" SERIAL PRIMARY KEY,
        "source" VARCHAR(255) NOT NULL,
        "token" VARCHAR(512) NOT NULL,
        "endpoint" VARCHAR(512) NOT NULL
      );
    `);

    await queryRunner.query(`
      INSERT INTO "credentials" ("source", "token", "endpoint")
      VALUES
        ('github', '<token>', 'https://api.github.com/graphql'),
        ('gitlab', '<token>', 'https://gitlab.com/api/graphql')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "credentials"`);
  }
}
