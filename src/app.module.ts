import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';
import { EnrollmentModule } from './enrollment/enrollment.module';

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
    QuizModule,
    EnrollmentModule,
  ],
})
export class AppModule {}