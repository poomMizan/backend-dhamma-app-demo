/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class addContentDTO {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNumberString()
  @IsNotEmpty()
  group_id: string;

  @IsNumberString()
  @IsNotEmpty()
  is_published: string;
}
