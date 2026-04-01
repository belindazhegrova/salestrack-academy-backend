import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import  cookieParser from 'cookie-parser';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
     app.use(cookieParser());
   app.useGlobalPipes(new ValidationPipe());
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    app.enableCors({
    origin: true,
    credentials: true,
  });
   app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
