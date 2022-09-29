/* eslint-disable prettier/prettier */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/attachments/attachment.entity';
import { AttachmentModule } from 'src/attachments/attachment.module';
import { AttachmentService } from 'src/attachments/attachment.service';
import { AuthAdminMiddleware } from 'src/middleware/auth-admin.middleware';
import { GroupController } from './group.controller';
import { Group } from './group.entity';
import { GroupService } from './group.service';

@Module({
  imports: [
    AttachmentModule,
    TypeOrmModule.forFeature([Group, Attachment]),
    MulterModule.register({
      dest: './public/img',
    }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.SECRET_KEY,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [GroupController],
  providers: [GroupService, AttachmentService],
}) /*{}*/
export class GroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthAdminMiddleware)
      .forRoutes({ path: 'groups/store', method: RequestMethod.POST });
  }
}
