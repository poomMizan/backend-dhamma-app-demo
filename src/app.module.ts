/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ContentModule } from './contents/content.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './contents/content.entity';
import { TypeOrmExModule } from './database/typeorm-ex.module';
import { ContentRepository } from './contents/content.repository';
import { AttachmentModule } from './attachments/attachment.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { UserModule } from './users/user.module';
import { User } from './users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './groups/group.module';

const env = process.env;
@Module({
  imports: [
    ConfigModule.forRoot({}),
    ContentModule,
    AttachmentModule,
    UserModule,
    GroupModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_TABLENAME,
      entities: [Content, User],
      synchronize: false,
      autoLoadEntities: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    TypeOrmExModule.forCustomRepository([ContentRepository]),
  ],
})
export class AppModule {}
