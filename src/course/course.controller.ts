import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/auth/jwt/auth.guard';

function editFileName(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileExtName = extname(file.originalname);
  callback(null, `${uniqueName}${fileExtName}`);
}

function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return callback(new Error('Only image files are allowed'), false);
  }
  callback(null, true);
}

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/courses',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCourseDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admin can create courses');
    }

    const thumbnail = file ? `/uploads/courses/${file.filename}` : undefined;

    return this.courseService.create(dto, req.user.id, thumbnail);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admin can update courses');
    }

    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admin can delete courses');
    }

    return this.courseService.remove(id);
  }
}