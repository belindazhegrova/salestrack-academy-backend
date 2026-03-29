import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

   if (!dto.answers || dto.answers.length < 2) {
    throw new BadRequestException('At least 2 answers required');
  }

    const hasEmpty = dto.answers.some(a => !a.text?.trim());
    if (hasEmpty) {
        throw new BadRequestException('Answers cannot be empty');
    }


    const correctAnswers = dto.answers.filter(a => a.isCorrect);
    if (correctAnswers.length !== 1) {
        throw new BadRequestException('Only one correct answer allowed');
    }


    return this.prisma.question.create({
      data: {
        title: dto.title,
        lessonId: dto.lessonId,
        answers: {
          create: dto.answers,
        },
      },
      include: {
        answers: true,
      },
    });
  }

  async findByLesson(lessonId: string) {
    return this.prisma.question.findMany({
      where: { lessonId },
      include: {
        answers: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.prisma.question.delete({
      where: { id },
    });
  }
}