import { IsInt, Max, Min } from 'class-validator';

export class UpdateQuizScoreDto {
  @IsInt()
  @Min(0)
  @Max(100)
  quizScore: number;
}