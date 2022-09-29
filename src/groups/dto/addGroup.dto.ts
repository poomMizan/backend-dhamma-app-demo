/* eslint-disable prettier/prettier */
import { IsBoolean, IsNotEmpty } from 'class-validator';

// file: File
// group_name: string
// group_detail: string
// tags: []
// is_published: bool

export class AddGroupDTO {
  @IsNotEmpty()
  group_name: string;

  @IsNotEmpty()
  group_detail: string;

  @IsNotEmpty()
  @IsBoolean()
  is_published: boolean;
}
