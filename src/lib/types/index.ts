export interface QuizQuestion {
  question: string;
  questionType?: 'text' | 'mcq';
  answer: string;
}
