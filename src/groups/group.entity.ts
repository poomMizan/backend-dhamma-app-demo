/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group_names')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_name: string;

  @Column()
  group_detail: string;

  @Column()
  is_published: number;

  @Column()
  cover_photo: number;

  @Column()
  created_at: Date;

  @Column()
  created_id: number;

  @Column()
  is_active: number;
}
