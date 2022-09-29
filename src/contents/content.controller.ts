/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { Content } from './content.entity';
import { UserService } from 'src/users/user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttachmentService } from 'src/attachments/attachment.service';
import { diskStorage } from 'multer';
import { addContentFileExtFilter } from 'src/attachments/addContentFileExtFilter';
import { addContentDTO } from './content.dto';
import { env } from 'process';

@Controller('/contents')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly attachmentService: AttachmentService,
    private readonly userService: UserService,
  ) {}

  @Get('test')
  async test() {
    return await this.contentService.test();
  }

  @Get('/')
  async getAllContent(): Promise<Content[]> {
    const data = await this.contentService.getAllContent();
    if (data) return data;
    else {
      throw new HttpException(
        `Unable to get contents`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('/latest/:tableName')
  async getLatestContent(
    @Param('tableName') tableName: string,
  ): Promise<Content[]> {
    const data = await this.contentService.getLatestContent(tableName);
    if (data) return data;
    else {
      throw new HttpException(
        `Unable to get contents data`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('/showcontent/:id')
  async getOneContent(@Param('id') id: number): Promise<unknown> {
    const data = await this.contentService.getOneContent(id);
    if (data) return data;
    else {
      throw new NotFoundException(`Content id [${id}] not found`);
    }
  }

  @Get('/group/:id')
  async getGroup(@Param('id') id: number): Promise<Content> {
    return await this.contentService.getGroup(id);
  }

  @Get('/listgroup')
  async getListGroup(): Promise<unknown> {
    return await this.contentService.getListGroup();
  }

  private sendErrorToClient(error_message: string): object {
    return { error_message };
  }

  @Post('store')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'media', maxCount: 1 },
      ],
      {
        fileFilter: addContentFileExtFilter,
        storage: diskStorage({
          destination: (req, file: Express.Multer.File, callback) => {
            const destination =
              file.fieldname == 'photo' ? env.DIR_CONTENT_IMG : env.DIR_MEDIA;
            callback(null, destination);
          },
          filename: (req, file: Express.Multer.File, callback) => {
            callback(null, file.originalname);
          },
        }),
      },
    ),
  )
  async addContent(
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File;
      media?: Express.Multer.File;
    },
    @Req() req,
    @Res({ passthrough: true }) response: Response,
    @Body() data: addContentDTO,
  ) {
    // check file extension
    let error_message = '';
    response.status(HttpStatus.BAD_REQUEST);
    //
    // user ต้องอัปโหลดให้ครบทั้ง 2 ไฟล์ คือ 1.ไฟล์รูปภาพ 2.มีเดีย
    //
    // fileFilter: addContentFileExtFilter,
    // ไฟล์ที่นามสกุล (ext) ไมถูกต้อง ตัวไฟล์จะไม่ถูกส่งมาที่ฟังชั้นนี้ === อัปโหลดไฟล์มาไม่ครบ
    //
    if (!files.photo || !files.media) {
      if (files.photo) {
        this.attachmentService.deleteFile(files.photo[0].path);
        return this.sendErrorToClient(
          req.fileExtensionError ?? 'ไฟล์มีเดียไม่ได้ถูกอัปโหลด',
        );
      }
      if (files.media) {
        this.attachmentService.deleteFile(files.media[0].path);
        return this.sendErrorToClient(
          req.fileExtensionError ?? `ไฟล์รูปภาพไม่ได้ถูกอัปโหลด`,
        );
      }
      return this.sendErrorToClient(
        req.fileExtensionError ?? `คุณไม่ได้อัปโหลดไฟล์รูปภาพและไฟล์มีเดีย`,
      );
    }
    // check file size ขนาดของไฟล์ ไฟล์รูปห้ามเกิน 1 MB ไฟล์มีเดียห้ามกิน 10 MB
    const photo = files.photo[0];
    const media = files.media[0];
    if (photo.size > 1000000 /*1 MB*/ || media.size > 10000000 /*10 MB*/) {
      error_message =
        photo.size > 1000000 /*1 MB*/
          ? `ไฟล์รูปภาพต้องมีขนาดไม่เกิน 1 MB ไฟล์ที่คุณอัปโหลดมามีขนาด ${
              photo.size / 1000000
            } MB`
          : `ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10 MB ไฟล์ที่คุณอัปโหลดมามีขนาด ${
              media.size / 1000000
            } MB`;
      this.attachmentService.deleteFile(photo.path);
      this.attachmentService.deleteFile(media.path);
      return this.sendErrorToClient(error_message);
    }
    // validate addContentDTO starts ....
    if (
      data.topic == '' ||
      data.detail == '' ||
      data.group_id == '' ||
      !isNaN(Number(data.group_id))
    ) {
      error_message = 'ข้อมูลคอนเทนต์ที่ใส่มาไม่ถูกต้อง';
      this.attachmentService.deleteFile(photo.path);
      this.attachmentService.deleteFile(media.path);
      return this.sendErrorToClient(error_message);
    }
    // validate addContentDTO ends ....
    const user = await this.userService.getUserFromJWT(req.cookies['jwt']);
    const contents = await this.contentService.addContent(
      photo.originalname,
      photo.path,
      media.originalname,
      media.path,
      data,
      user.id,
    );
    if (contents) {
      response.status(HttpStatus.CREATED);
      return contents;
    }
  }
}
