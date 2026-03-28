import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/lessons',
          filename: (req, file, callback) => {
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileExtName = extname(file.originalname);
            callback(null, `${uniqueName}${fileExtName}`);
          },
        }),
      }
    )
  )
  create(
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      pdf?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    },
    @Body() dto: CreateLessonDto
  ) {
    const videoUrl = files.video?.[0]
      ? `/uploads/lessons/${files.video[0].filename}`
      : undefined;

    const pdfUrl = files.pdf?.[0]
      ? `/uploads/lessons/${files.pdf[0].filename}`
      : undefined;

    const audioUrl = files.audio?.[0]
      ? `/uploads/lessons/${files.audio[0].filename}`
      : undefined;

    return this.lessonService.create({
      ...dto,
      videoUrl,
      pdfUrl,
      audioUrl,
    });
  }

  @Get()
  findAll(@Query('courseId') courseId?: string) {
    return this.lessonService.findAll(courseId);
  }

   @Patch('reorder')
   reorder(@Body() body: { id: string; order: number }[]) {
  return this.lessonService.reorder(body);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

 
}