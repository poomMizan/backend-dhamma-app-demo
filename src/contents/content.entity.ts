/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @Column()
  detail: string;

  @Column()
  chapter: number;

  @Column()
  group_id: number;

  @Column()
  cover_photo: string;

  @Column()
  attachment_id: number;

  @Column()
  duration: number;

  @Column()
  created_id: string;

  @Column({
    default: () => 'now()',
    type: 'datetime',
  })
  created_at: Date;

  @Column({
    default: () => 'now()',
    type: 'datetime',
  })
  updated_at: Date;

  @Column()
  is_active: number;

  // @Column({ nullable: true })
  // tag_id: number;
}
