import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findOne(id);

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.course.delete({
      where: { id },
    });
  }
}