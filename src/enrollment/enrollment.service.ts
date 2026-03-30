import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string, courseId: string, adminId?: string, role?: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        ...(role === 'ADMIN' ? { course: { userId: adminId } } : {}),
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
    adminId: string,
    role: string,
  ) {
    const enrollment = await this.findOne(userId, courseId, adminId, role);

    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId },
    });

    const passingScore = quiz?.passingScore ?? 80;
    const passedQuiz = (enrollment.quizScore ?? 0) >= passingScore;

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        completed: progress >= 100 && passedQuiz,
      },
    });
  }

  async updateQuizScore(
    userId: string,
    courseId: string,
    quizScore: number,
    adminId: string,
    role: string,
  ) {
    const enrollment = await this.findOne(userId, courseId, adminId, role);

    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId },
    });

    const passingScore = quiz?.passingScore ?? 80;

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        quizScore,
        completed: enrollment.progress >= 100 && quizScore >= passingScore,
      },
    });
  }

  async getAgentCourses(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            quiz: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      progress: enrollment.progress,
      completed: enrollment.completed,
      quizScore: enrollment.quizScore,
      createdAt: enrollment.createdAt,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        totalLessons: enrollment.course.lessons.length,
        totalQuestions: enrollment.course.quiz?.questions.length ?? 0,
        lessons: enrollment.course.lessons,
      },
    }));
  }

  async getAgentProgress(userId: string, adminId: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'AGENT') {
      throw new BadRequestException('Not an agent');
    }

    if (role === 'ADMIN' && user.adminId !== adminId) {
      throw new NotFoundException('Agent not found');
    }

    return this.prisma.enrollment.findMany({
      where: {
        userId,
        ...(role === 'ADMIN' ? { course: { userId: adminId } } : {}),
      },
      include: {
        course: {
          include: {
            quiz: true,
          },
        },
      },
    });
  }

  async getAgentCourseDetails(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            quiz: {
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
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Assigned course not found');
    }

    return enrollment;
  }

  async getAllEnrollments() {
    return this.prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
      },
    });
  }

  async getAdminStats(adminId: string) {
    const totalAgents = await this.prisma.user.count({
      where: {
        role: 'AGENT',
        adminId,
      },
    });

    const totalCourses = await this.prisma.course.count({
      where: {
        userId: adminId,
      },
    });

    const totalAssignments = await this.prisma.enrollment.count({
      where: {
        course: {
          userId: adminId,
        },
      },
    });

    const completed = await this.prisma.enrollment.count({
      where: {
        completed: true,
        course: {
          userId: adminId,
        },
      },
    });

    const avgScore = await this.prisma.enrollment.aggregate({
      where: {
        course: {
          userId: adminId,
        },
      },
      _avg: {
        quizScore: true,
      },
    });

    return {
      totalAgents,
      totalCourses,
      totalAssignments,
      completedCourses: completed,
      averageQuizScore: avgScore._avg.quizScore || 0,
    };
  }
}