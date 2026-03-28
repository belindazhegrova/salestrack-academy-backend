import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum LessonType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
}

export class CreateLessonDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

 @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;


  @IsString()
  courseId: string;
}