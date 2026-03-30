import {
  Controller,
  Patch,
  Param,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
    @Req() req: any,
  ) {
    return this.enrollmentService.updateProgress(
      userId,
      courseId,
      body.progress,
      req.user.userId,
      req.user.role,
    );
  }

  @Patch(':userId/:courseId/quiz-score')
  updateQuizScore(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { quizScore: number },
    @Req() req: any,
  ) {
    return this.enrollmentService.updateQuizScore(
      userId,
      courseId,
      body.quizScore,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('my-courses')
  getMyCourses(@Req() req: any) {
    return this.enrollmentService.getAgentCourses(req.user.userId);
  }

  @Get('my-courses/:courseId')
  getMyCourseDetails(@Req() req: any, @Param('courseId') courseId: string) {
    return this.enrollmentService.getAgentCourseDetails(req.user.userId, courseId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.enrollmentService.getAdminStats(req.user.userId);
  }

  @Get('agent/:userId')
  getAgentProgress(@Param('userId') userId: string, @Req() req: any) {
    return this.enrollmentService.getAgentProgress(
      userId,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('certificate/:enrollmentId')
async downloadCertificate(
  @Param('enrollmentId') enrollmentId: string,
  @Req() req: any,
  @Res() res: Response,
) {
  const pdf = await this.enrollmentService.generateCertificate(
    enrollmentId,
    req.user,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=certificate.pdf',
  });

  res.send(pdf);
}
}