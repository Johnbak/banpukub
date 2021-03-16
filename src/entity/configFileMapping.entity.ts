import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ConfigFile } from './configFile.entity';
@Entity({
  name: 'enigma_config_file_mapping'
})
export class ConfigMapping {
  @PrimaryGeneratedColumn({ name: 'id' }) id!: number;

  @Column({ name: 'sheet' })
  sheet!: number;

  @Column({ name: 'key' })
  key!: string;

  @Column({ name: 'column_point' })
  columnPoint!: number;

  @Column({ name: 'row_start' })
  rowStart!: number;

  @Column({ name: 'row_stop' })
  rowStop!: number;

  @Column({ name: 'unit' })
  unit!: string;

  @Column({ name: 'filename' })
  filename!: string;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => ConfigFile, (configFile) => configFile.configFileMappings)
  @JoinColumn({ name: 'config_file_id' })
  configFile!: ConfigFile;
  // @ManyToOne(() => ConfigFile, configFile => configFile.configFileMappings)
  // configFile: ConfigFile;
}
