export type VerificationMethod = 'questions' | 'otp' | 'both';
export type OTPMethod = 'email' | 'phone';

export interface MCOption {
  label: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  questionType?: 'text' | 'mcq';
  answer: string;
  options?: MCOption[];
}

export interface VerificationConfig {
  method: VerificationMethod;
  otpMethod?: OTPMethod;
  otpContact?: string; // email / phone
  questions?: QuizQuestion[];
}
