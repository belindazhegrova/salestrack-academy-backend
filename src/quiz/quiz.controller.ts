import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() dto: CreateQuestionDto, @Req() req: any) {
    return this.quizService.create(dto, req.user.userId, req.user.role);
  }

  @Get()
  find(@Query('courseId') courseId: string, @Req() req: any) {
    return this.quizService.findByCourse(courseId, req.user.userId, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.quizService.remove(id, req.user.userId, req.user.role);
  }

  @Post('submit')
  submit(@Req() req: any, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(req.user.userId, dto);
  }
}