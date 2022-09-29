import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import * as express from 'express';
async function bootstrap() {
  const PORT = 3000;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({ credentials: true });
  await app.listen(PORT);
}
bootstrap();
