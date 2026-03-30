import { IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
export class CreateQuestionDto {
  courseId: string;
  title: string;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
}