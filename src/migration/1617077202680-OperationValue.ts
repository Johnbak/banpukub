import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class OperationValue1617077202680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enigma_value',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isPrimary: true
          },
          {
            name: 'plant_name',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'date_time',
            type: 'datetime'
          },
          {
            name: 'radiation',
            type: 'float(53)'
          },
          {
            name: 'power_generation',
            type: 'float(53)'
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
