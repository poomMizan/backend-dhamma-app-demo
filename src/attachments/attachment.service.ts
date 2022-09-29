/* eslint-disable prettier/prettier */
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddPhotoDTO } from './attachment.dto';
import { Attachment } from './attachment.entity';
import * as fs from 'fs';
@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    readonly attachmentRepository: Repository<Attachment>,
  ) {}
  async addPhoto(photoDetail: AddPhotoDTO): Promise<Attachment | undefined> {
    //
    return await this.attachmentRepository.save(photoDetail);
  }

  deleteFile(path: string): void {
    fs.unlink(path, (err) => {
      if (err)
        throw new UnprocessableEntityException('Error delete file: ' + err);
    });
  }

  renameFile(targetFile: string, newName: string): void {
    fs.rename(targetFile, newName, (err) => {
      if (err)
        throw new UnprocessableEntityException('Error rename file' + err);
    });
  }
}
