import { IsString, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;
}