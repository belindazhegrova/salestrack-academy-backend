import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.quizService.create(dto);
  }

  @Get()
  find(@Query('lessonId') lessonId: string) {
    return this.quizService.findByLesson(lessonId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}