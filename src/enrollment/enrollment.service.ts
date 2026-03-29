import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}


  async findOne(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

 
  async updateProgress(userId: string, courseId: string, progress: number) {
    await this.findOne(userId, courseId);

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        completed: progress >= 100,
      },
    });
  }


  async updateQuizScore(userId: string, courseId: string, quizScore: number) {
    await this.findOne(userId, courseId);

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        quizScore,
      },
    });
  }


  async getAgentCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }


  async getAllEnrollments() {
    return this.prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
      },
    });
  }


  async getAdminStats() {
    const totalAgents = await this.prisma.user.count({
      where: { role: 'AGENT' },
    });

    const totalCourses = await this.prisma.course.count();

    const totalAssignments = await this.prisma.enrollment.count();

    const completed = await this.prisma.enrollment.count({
      where: { completed: true },
    });

    const avgScore = await this.prisma.enrollment.aggregate({
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


  async getAgentProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'AGENT') {
      throw new BadRequestException('Not an agent');
    }

    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });
  }


}