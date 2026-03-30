import {
  IsArray,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class SubmittedAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answerId: string;
}

export class SubmitQuizDto {
  courseId: string;
  answers: {
    questionId: string;
    answerId: string;
  }[];
}