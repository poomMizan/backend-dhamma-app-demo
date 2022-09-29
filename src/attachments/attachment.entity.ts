/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: number;

  @Column()
  path: string;

  @Column()
  detail: string;

  @Column()
  created_id: number;

  @Column()
  created_at: Date;

  @Column()
  is_active: number;
}
