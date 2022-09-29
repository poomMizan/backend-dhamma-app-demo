/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Res } from '@nestjs/common';
import { createReadStream } from 'graceful-fs';
import { AttachmentService } from './attachment.service';

@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  // get ไฟล์รูปภาพ (user profile pic, content & album cover photo)
  @Get('/getphoto/:filename')
  async getPhoto(
    @Param('filename') filename: string,
    @Res() res,
  ): Promise<void> {
    const filePath = `${process.cwd()}\\public\\img\\${filename}`;
    await res.sendFile(filePath);
  }

  // get ไฟล์เสียงและวีดีโอ
  @Get('/getmedia/:filename')
  async getFile(
    @Param('filename') filename: string,
    @Res() res,
  ): Promise<void> {
    const filePath = `${process.cwd()}\\public\\media\\${filename}`;
    const file = createReadStream(filePath);
    await file.pipe(res);
  }
}
