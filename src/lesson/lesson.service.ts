import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async ensureCourseOwner(courseId: string, adminId: string, role: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        ...(role === 'ADMIN' ? { userId: adminId } : {}),
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async ensureLessonOwner(id: string, adminId: string, role: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        ...(role === 'ADMIN'
          ? {
              course: {
                userId: adminId,
              },
            }
          : {}),
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(dto: CreateLessonDto, adminId: string, role: string) {
    await this.ensureCourseOwner(dto.courseId, adminId, role);

    const lastLesson = await this.prisma.lesson.findFirst({
      where: { courseId: dto.courseId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
        videoUrl: dto.videoUrl,
        pdfUrl: dto.pdfUrl,
        audioUrl: dto.audioUrl,
        order: dto.order ?? nextOrder,
        courseId: dto.courseId,
      },
    });
  }

  async findAll(courseId: string, adminId: string, role: string) {
    await this.ensureCourseOwner(courseId, adminId, role);

    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, adminId: string, role: string) {
    return this.ensureLessonOwner(id, adminId, role);
  }

  async update(id: string, dto: UpdateLessonDto, adminId: string, role: string) {
    await this.ensureLessonOwner(id, adminId, role);

    return this.prisma.lesson.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, adminId: string, role: string) {
    await this.ensureLessonOwner(id, adminId, role);

    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async reorder(
    data: { id: string; order: number }[],
    adminId: string,
    role: string
  ) {

    for (const item of data) {
      await this.ensureLessonOwner(item.id, adminId, role);
    }

    const updates = data.map((item) =>
      this.prisma.lesson.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}