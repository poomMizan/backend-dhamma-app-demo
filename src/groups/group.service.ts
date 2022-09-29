/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddGroupDTO } from './dto/addGroup.dto';
import { Group } from './group.entity';
import { AttachmentService } from 'src/attachments/attachment.service';
import { AddPhotoDTO } from 'src/attachments/attachment.dto';

@Injectable({ scope: Scope.REQUEST })
export class GroupService {
  constructor(
    @InjectRepository(Group) readonly groupRepository: Repository<Group>,
    private readonly attachmentService: AttachmentService,
  ) {}

  async addGroup(
    fileName: string,
    data: any,
    userId: number,
  ): Promise<Group | undefined> {
    const photoDetail: AddPhotoDTO = {
      type: 1,
      path: fileName,
      detail: fileName,
      created_id: userId,
    };
    const savePhoto = await this.attachmentService.addPhoto(photoDetail);
    if (!savePhoto) {
      throw new UnprocessableEntityException(
        'Unable to save Coverphoto for the album',
      );
    }
    const saveData = {
      group_name: data.group_name,
      group_detail: data.group_detail,
      cover_photo: savePhoto.id,
      created_id: userId,
      is_published: data.is_published,
    };
    return await this.groupRepository.save(saveData);
  }
}
