/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CustomRepository } from '../database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Content } from './content.entity';

@CustomRepository(Content)
export class ContentRepository extends Repository<Content> {
  async test() {
    // const contents = this.createQueryBuilder('contents')
    //   .innerJoinAndSelect('contents.cover_photo', 'attachments')
    //   .innerJoinAndSelect('contents.created_id', 'users')
    //   .select([
    //     'contents.name',
    //     'contents.detail',
    //     'contents.chaptor',
    //     'contents.group_id',
    //     'contents.cover_photo',
    //     'contents.attachment_id',
    //     'contents.created_id',
    //     'contents.attachment_id',
    //     'contents.duration',
    //     'attachments.path',
    //     'users.username',
    //   ])
    //   .getSql();
    // console.log(contents);
    return { message: 'Test' };
  }

  async getAllContent(): Promise<any[]> {
    const data = await this.query(
      `SELECT c.id,
        c.topic, 
        c.detail,
        c.chapter,
        c.group_id,
        c.cover_photo,
        c.created_id,
        c.attachment_id,
        c.duration,
        a.path,
        u.username 
      FROM contents c
      INNER JOIN attachments a ON c.cover_photo = a.id
      INNER JOIN users u ON c.created_id = u.id
      ;`,
    );
    if (data) {
      return data;
    } else {
      throw new HttpException(
        `Unable to get contents`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
  
  async getLatestContent(tableName: string): Promise<Content[]> {
    const name = tableName === 'contents' ? 'topic' : 'group_name';
    const data = await this.query(
      `SELECT c.id,
        c.${name},
        a.path,
        u.username 
      FROM ${tableName} c
      INNER JOIN attachments a ON c.cover_photo = a.id
      INNER JOIN users u ON c.created_id = u.id
      ORDER BY c.id DESC LIMIT 2;`,
    );
    if (data) {
      return data;
    } else {
      throw new HttpException(
        `Unable to get contents`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  // อย่าลืมใส่ escapeQueryWithParameters
  // อย่าลืมใส่ escapeQueryWithParameters
  async getOneContent(id: number): Promise<any> {
    const data = await this.query(
      `SELECT c.*,
        a.path,
        a2.path as media,
        u.username
      FROM contents c
      INNER JOIN attachments a ON c.cover_photo = a.id
      INNER JOIN attachments a2 on c.attachment_id = a2.id
      INNER JOIN users u ON c.created_id = u.id
      where c.id = ${id};`,
    );
    if (data.length > 0) {
      return data;
    } else {
      throw new NotFoundException(`Content id [${id}] not found`);
    }
  }

  async getListGroup(): Promise<any> {
    const data = await this.query(
      `SELECT g.id,
        g.group_name,
        g.group_detail,
        g.cover_photo,
        a.path,
        u.username 
      FROM group_names g		
      INNER JOIN attachments a ON g.cover_photo = a.id
      INNER JOIN users u ON g.created_id = u.id`,
    );
    if (data.length > 0) {
      return data;
    } else {
      throw new NotFoundException(`Group not found`);
    }
  }

  // อย่าลืมใส่ escapeQueryWithParameters
  // อย่าลืมใส่ escapeQueryWithParameters
  async getGroup(id: number): Promise<object> {
    const groupData = await this.query(`
      SELECT g.id,
        g.group_name,
        g.group_detail,
        g.cover_photo,
        a.path,
        u.username 
      FROM group_names g		
      INNER JOIN attachments a ON g.cover_photo = a.id
      INNER JOIN users u ON g.created_id = u.id
      WHERE g.id = ${id};
    `);
    if (groupData.length == 0) {
      throw new NotFoundException(`Group id [${id}] not found`);
    }
    // อย่าลืมใส่ escapeQueryWithParameters
    // อย่าลืมใส่ escapeQueryWithParameters
    const contents = await this.query(`
      SELECT c.id,
        c.topic,
        c.duration,
        a.path,
        u.username
      FROM contents c
      INNER JOIN attachments a ON c.cover_photo = a.id
      INNER JOIN users u ON c.created_id = u.id
      WHERE c.group_id = ${id} ORDER BY chapter ASC;
    `);
    // const contentsData = await this.find({
    //   where: { GROUP_ID: id },
    //   order: { CHAPTER: 'DESC' },
    // });
    const [group] = groupData;
    return { group, contents };
  }
}
