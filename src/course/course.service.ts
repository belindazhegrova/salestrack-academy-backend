import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourseDto, userId: string, thumbnail?: string) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        thumbnail,
        userId,
      },
    });
  }

  async findAll(userId: string, role: string) {
    return this.prisma.course.findMany({
      where: role === 'ADMIN' ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        ...(role === 'ADMIN' ? { userId } : {}),
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto, userId: string) {
    await this.findOne(id, userId, 'ADMIN');

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId, 'ADMIN');

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async assignCourse(dto: { userId: string; courseId: string }, adminId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        userId: adminId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const agent = await this.prisma.user.findFirst({
      where: {
        id: dto.userId,
        role: 'AGENT',
        adminId,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dto.userId,
          courseId: dto.courseId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User already assigned to this course');
    }

    return this.prisma.enrollment.create({
      data: {
        userId: dto.userId,
        courseId: dto.courseId,
      },
    });
  }
}