import { IsString } from 'class-validator';

export class AssignCourseDto {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;
}