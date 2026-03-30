import {
  Controller,
  Patch,
  Param,
  Body,
  Get,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}


  @Patch(':userId/:courseId/progress')
  updateProgress(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { progress: number },
  ) {
    return this.enrollmentService.updateProgress(
      userId,
      courseId,
      body.progress,
    );
  }

  @Patch(':userId/:courseId/quiz-score')
  updateQuizScore(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { quizScore: number },
  ) {
    return this.enrollmentService.updateQuizScore(
      userId,
      courseId,
      body.quizScore,
    );
  }

  @Get('my-courses')
  getMyCourses(@Req() req: any) {
    return this.enrollmentService.getAgentCourses(req.user.userId);
  }

  @Get('my-courses/:courseId')
getMyCourseDetails(@Req() req: any, @Param('courseId') courseId: string) {
  console.log('USER111111:', req.user); 
  return this.enrollmentService.getAgentCourseDetails(req.user.userId, courseId);
}


  @Get('stats')
  getStats() {
    return this.enrollmentService.getAdminStats();
  }

  @Get('agent/:userId')
  getAgentProgress(@Param('userId') userId: string) {
    return this.enrollmentService.getAgentProgress(userId);
  }



}