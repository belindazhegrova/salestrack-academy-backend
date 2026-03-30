import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!dto.answers || dto.answers.length < 2) {
      throw new BadRequestException('At least 2 answers required');
    }

    const hasEmptyAnswer = dto.answers.some((a) => !a.text?.trim());
    if (hasEmptyAnswer) {
      throw new BadRequestException('Answers cannot be empty');
    }

    const correctAnswers = dto.answers.filter((a) => a.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new BadRequestException('Only one correct answer allowed');
    }

    let quiz = await this.prisma.quiz.findUnique({
      where: { courseId: dto.courseId },
    });

    if (!quiz) {
      quiz = await this.prisma.quiz.create({
        data: {
          courseId: dto.courseId,
          passingScore: 80,
        },
      });
    }

    return this.prisma.question.create({
      data: {
        title: dto.title,
        quizId: quiz.id,
        answers: {
          create: dto.answers,
        },
      },
      include: {
        answers: true,
      },
    });
  }

  async findByCourse(courseId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId },
      include: {
        questions: {
          include: {
            answers: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      return [];
    }

    return quiz.questions;
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

  async submitQuiz(userId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId: dto.courseId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.questions.length) {
      throw new BadRequestException('No quiz questions found for this course');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    let correct = 0;

    for (const question of quiz.questions) {
      const submitted = dto.answers.find(
        (a) => a.questionId === question.id,
      );

      if (!submitted) continue;

      const correctAnswer = question.answers.find((a) => a.isCorrect);

      if (correctAnswer?.id === submitted.answerId) {
        correct++;
      }
    }

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= quiz.passingScore;

    await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
      data: {
        quizScore: score,
        completed: passed && enrollment.progress >= 100,
      },
    });

    return {
      score,
      total,
      correct,
      passed,
      passingScore: quiz.passingScore,
    };
  }
}