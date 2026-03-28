import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

    }),
    PrismaModule,
    UserModule,
    AuthModule,
    CourseModule, 
    LessonModule,
  ],
})
export class AppModule {}