/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column()
  pic_attachment: string;

  @Column()
  created_at: Date;

  @Column()
  login_with: number;

  @Column()
  permission: number;

  @Column()
  last_login: number;
}
