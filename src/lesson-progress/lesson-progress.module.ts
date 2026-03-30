import { Module } from '@nestjs/common';
import { LessonProgressController } from './lesson-progress.controller';
import { LessonProgressService } from './lesson-progress.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LessonProgressController],
  providers: [LessonProgressService, PrismaService],
})
export class LessonProgressModule {}