import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class OperationPreview1617096090571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enigma_preview',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'plant_name',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'plain_text',
            type: 'text'
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'created_at',
            type: 'timestamp'
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
