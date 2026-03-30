import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';
import { LessonProgressService } from './lesson-progress.service';

@UseGuards(JwtAuthGuard)
@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post(':lessonId/complete')
  completeLesson(@Req() req: any, @Param('lessonId') lessonId: string) {
    return this.lessonProgressService.completeLesson(req.user.userId, lessonId);
  }

  @Get('course/:courseId')
  getCourseLessonProgress(@Req() req: any, @Param('courseId') courseId: string) {
    return this.lessonProgressService.getCourseLessonProgress(
      req.user.userId,
      courseId,
    );
  }
}