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
    origin: [
      'https://salestrack-academy-frontend.onrender.com',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
     methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
   app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const url = await app.getUrl();
}
bootstrap();
