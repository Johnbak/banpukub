import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryColumn,
    UpdateDateColumn,
  } from 'typeorm';

  @Entity({
    name: 'enigma_value'
  })

  export class EnigmaValue {
    @PrimaryColumn({ name: 'id' })
    id!: string;

    @Column({ name: 'plant_name' })
    plantName!: string;

    @Column({ name: 'date_time' })
    dateTime!: Date;
    
    @Column({ name: 'radiation' })
    radiation!: number;

    @Column({ name: 'power_generation' })
    powerGeneration!: number;

    @UpdateDateColumn()
    @Column({ name: 'updated_at' })
    updatedAt!: Date;

    @CreateDateColumn()
    @Column({ name: 'created_at' })
    createdAt!: Date;
  }