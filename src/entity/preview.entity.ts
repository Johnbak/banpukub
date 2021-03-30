import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn
  } from 'typeorm';

  @Entity({
    name: 'enigma_preview'
  })

  export class EnigmaPreview {
    @PrimaryGeneratedColumn({ name: 'id' })
    id!: number;

    @Column({ name: 'plant_name' })
    plantName!: string;

    @Column({ name: 'date' })
    dateTime!: Date;

    @Column({ name: 'plain_text' })
    plainText!: string;
    
    @UpdateDateColumn()
    @Column({ name: 'updated_at' })
    updatedAt!: Date;

    @CreateDateColumn()
    @Column({ name: 'created_at' })
    createdAt!: Date;
  }