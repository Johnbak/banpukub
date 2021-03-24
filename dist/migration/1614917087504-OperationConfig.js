"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationConfig1614917087504 = void 0;
const typeorm_1 = require("typeorm");
class OperationConfig1614917087504 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'enigma_config_file',
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
                    name: 'format_file',
                    type: 'varchar',
                    length: '255'
                },
                {
                    name: 'delimiter',
                    type: 'varchar',
                    length: '30',
                    isNullable: true
                },
                {
                    name: 'group_plant',
                    type: 'varchar',
                    length: '100',
                    isNullable: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp'
                }
            ]
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'enigma_config_file_format_date',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'column_point',
                    type: 'int'
                },
                {
                    name: 'datetime_format',
                    type: 'nvarchar',
                    length: '100'
                },
                {
                    name: 'created_at',
                    type: 'timestamp'
                },
                {
                    name: 'config_file_id',
                    type: 'int'
                }
            ]
        }), true);
        await queryRunner.createForeignKey('enigma_config_file_format_date', new typeorm_1.TableForeignKey({
            columnNames: ['config_file_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'enigma_config_file',
            onDelete: 'CASCADE'
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'enigma_config_file_mapping',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'sheet',
                    type: 'int'
                },
                {
                    name: 'key',
                    type: 'varchar',
                    length: '100'
                },
                {
                    name: 'column_point',
                    type: 'int'
                },
                {
                    name: 'row_start',
                    type: 'int'
                },
                {
                    name: 'row_stop',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'unit',
                    type: 'varchar',
                    length: '120'
                },
                {
                    name: 'filename',
                    type: 'nvarchar',
                    length: '120',
                    isNullable: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp'
                },
                {
                    name: 'config_file_id',
                    type: 'int'
                }
            ]
        }), true);
        await queryRunner.createForeignKey('enigma_config_file_mapping', new typeorm_1.TableForeignKey({
            columnNames: ['config_file_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'enigma_config_file',
            onDelete: 'CASCADE'
        }));
    }
    async down(queryRunner) { }
}
exports.OperationConfig1614917087504 = OperationConfig1614917087504;
