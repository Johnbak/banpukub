import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { ConfigFile } from './configFile.entity';
@Entity({
  name: 'enigma_config_file_format_date'
})
export class ConfigDate {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'column_point' })
  columnPoint!: number;

  @Column({ name: 'datetime_format' })
  datetimeFormat!: string;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt!: Date;

  @OneToOne(() => ConfigFile, {
    // eager: true,
    // cascade: true
  })
  @JoinColumn({ name: 'config_file_id' })
  configfile!: ConfigFile;
}
