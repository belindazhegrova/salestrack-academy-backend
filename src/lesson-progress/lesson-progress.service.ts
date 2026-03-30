import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LessonProgressService {
  constructor(private prisma: PrismaService) {}

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this course');
    }

    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    const totalLessons = await this.prisma.lesson.count({
      where: {
        courseId: lesson.courseId,
      },
    });

    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        lesson: {
          courseId: lesson.courseId,
        },
      },
    });

    const progress =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    const updatedEnrollment = await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
      data: {
        progress,
        completed: progress >= 100,
      },
    });

    return {
      message: 'Lesson marked as completed',
      enrollment: updatedEnrollment,
      totalLessons,
      completedLessons,
      progress,
    };
  }

  async getCourseLessonProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this course');
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessonProgress: {
          where: { userId },
        },
      },
    });

    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      order: lesson.order,
      completed: lesson.lessonProgress[0]?.completed ?? false,
      completedAt: lesson.lessonProgress[0]?.completedAt ?? null,
    }));
  }
}