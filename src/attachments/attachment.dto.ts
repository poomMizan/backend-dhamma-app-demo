/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddPhotoDTO {
  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  created_id: number;
}
