/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { AttachmentService } from 'src/attachments/attachment.service';
import { DataSource } from 'typeorm';
import { addContentDTO } from './content.dto';
import { Content } from './content.entity';
import { ContentRepository } from './content.repository';
@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly attachmentService: AttachmentService,
    private dataSource: DataSource,
  ) {}

  private photoUrl = `/attachments/getphoto/` as string;
  private mediaUrl = `/attachments/getmedia/` as string;

  // convert seconds to hour & mins
  // convert seconds to hour & mins
  private secondToHM(second: number): string {
    const s = Number(second);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const hour = h > 0 ? `${h} ชั่วโมง` : '';
    const minute = m > 0 ? ` ${m} นาที` : '';
    return hour + minute;
  }

  async test() {
    return await this.contentRepository.test();
  }

  async getAllContent(): Promise<Content[]> {
    const data = await this.contentRepository.getAllContent();
    data.forEach((d) => {
      d['time'] = this.secondToHM(d.duration);
      d['path'] = this.photoUrl + d['path'];
    });
    return data;
  }

  async getLatestContent(tableName: string): Promise<Content[]> {
    const data = await this.contentRepository.getLatestContent(tableName);
    data.forEach((d) => {
      d['time'] ?? this.secondToHM(d.duration);
      d['path'] = this.photoUrl + d['path'];
    });
    return data;
  }

  async getOneContent(id: number): Promise<any> {
    const data = await this.contentRepository.getOneContent(id);
    const [content] = data;
    content['time'] = this.secondToHM(content.duration);
    content['path'] = this.photoUrl + content['path'];
    content['media'] = this.mediaUrl + content['media'];
    return content;
  }

  async getGroup(id: number): Promise<any> {
    const data = await this.contentRepository.getGroup(id);
    data['group'].path = this.photoUrl + data['group'].path;
    data['contents'].forEach((d: Content) => {
      d['time'] = this.secondToHM(d.duration);
      d['path'] = this.photoUrl + d['path'];
    });
    return data;
  }

  async getListGroup(): Promise<any> {
    const data = await this.contentRepository.getListGroup();
    data.forEach((d: Content) => {
      d['path'] = this.photoUrl + d['path'];
    });
    return data;
  }

  async addContent(
    photoName: string,
    photoPath: string,
    mediaName: string,
    mediaPath: string,
    data: addContentDTO,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const [attachmentSql, attachmentParams] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          `INSERT INTO attachments (type, path, created_id)
          VALUES (2, :photoName, :userId),
          (3, :mediaName, :userId);
          `,
          {
            photoName,
            mediaName,
            userId,
          },
          {},
        );
      console.log('before await queryRunner.query(attach, )');
      const attachment = await queryRunner.query(
        attachmentSql,
        attachmentParams,
      );
      const [chapterSql, chapterParam] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          'SELECT MAX(chapter) AS chapter FROM contents where group_id = :group_id;',
          {
            group_id: data.group_id,
          },
          {},
        );
      // get เลขตอน (chapter) ของ album
      const chapter = await queryRunner.query(chapterSql, chapterParam);
      const [addContentSql, addContentParams] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          `INSERT INTO contents
          (topic, detail, chapter, group_id, cover_photo, attachment_id, is_published, created_id)
          VALUES
          (:topic, :detail, :chapter, :group_id, :cover_photo, :attachment_id, :is_published,	:created_id);`,
          {
            topic: data.topic,
            detail: data.detail,
            chapter: chapter + 1,
            group_id: data.group_id,
            cover_photo: attachment.insertId,
            attachment_id: attachment.insertId + 1,
            is_published: data.is_published,
            created_id: userId,
          },
          {},
        );
      const add_content = await queryRunner.query(
        addContentSql,
        addContentParams,
      );
      await queryRunner.commitTransaction();
      return add_content;
    } catch (err) {
      // DB Rollbacked
      // Deleted all uploaded files
      this.attachmentService.deleteFile(photoPath);
      this.attachmentService.deleteFile(mediaPath);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
