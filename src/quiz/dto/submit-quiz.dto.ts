

export class SubmitQuizDto {
  courseId: string;
  answers: {
    questionId: string;
    answerId: string;
  }[];
}