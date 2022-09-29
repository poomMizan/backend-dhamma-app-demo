/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import { AddGroupDTO } from './dto/addGroup.dto';
import { imageFileFilter } from '../attachments/imageFileFilter';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('store')
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './public/img',
        filename: (req, file: /*Express.Multer.File |*/ any, callback) => {
          const filename = file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  async addGroup(
    @Req() request: Request | any,
    @Res({ passthrough: true }) response: Response,
    @Body() data: AddGroupDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Group | object | undefined> {
    let error_message = '';
    const user = await this.jwtService.verifyAsync(request.cookies['jwt']);
    if (request.imageFileValidationError) {
      // ถ้าไฟล์รูปที่อัพโหลดไม่ผ่าน validate จะเกิด error
      // และ return HttpStatus 400 Bad Request พร้อมกับ error_message ไปที่ client
      error_message = request.imageFileValidationError;
      response.status(HttpStatus.BAD_REQUEST);
      return { status: HttpStatus.BAD_REQUEST, error_message };
    }
    const fileName = file.originalname;
    return await this.groupService.addGroup(fileName, data, user.id);
  }
}
