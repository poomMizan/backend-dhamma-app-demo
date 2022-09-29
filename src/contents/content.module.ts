import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/attachments/attachment.entity';
import { AttachmentService } from 'src/attachments/attachment.service';
import { AuthAdminMiddleware } from 'src/middleware/auth-admin.middleware';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([ContentRepository]),
    TypeOrmModule.forFeature([Attachment, User]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.SECRET_KEY,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [ContentController],
  providers: [ContentService, AttachmentService, UserService],
})
export class ContentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthAdminMiddleware)
      .forRoutes({ path: 'contents/store', method: RequestMethod.POST });
  }
}
