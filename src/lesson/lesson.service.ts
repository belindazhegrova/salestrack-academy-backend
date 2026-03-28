import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLessonDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

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

  async findAll(courseId?: string) {
    return this.prisma.lesson.findMany({
      where: courseId ? { courseId } : {},
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id);

    return this.prisma.lesson.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async reorder(data: { id: string; order: number }[]) {
  const updates = data.map((item) =>
    this.prisma.lesson.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );

  return this.prisma.$transaction(updates);
}
}