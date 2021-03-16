import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { ConfigMapping } from './configFileMapping.entity';
import { ConfigDate } from './configFileFormatDate.entity';

@Entity({
  name: 'enigma_config_file'
})
export class ConfigFile {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'plant_name' })
  plantName!: string;

  @Column({ name: 'format_file' })
  formatFile!: string;

  @Column({ name: 'delimiter' })
  delimiter!: string;

  @Column({ name: 'group_plant' })
  groupPlant!: string;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(
    (type) => ConfigMapping,
    (configmapping: ConfigMapping) => configmapping.configFile,
    { cascade: ['insert', 'update'], eager: true }
  )
  configFileMappings!: ConfigMapping[];

  @OneToOne(() => ConfigDate, (configDate) => configDate.configfile, {
    cascade: ['insert', 'update'],
    eager: true
  }) // specify inverse side as a second parameter
  configFileFormatDate!: ConfigDate;
}
