import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { VerificationMethod, QuizQuestion, OTPMethod } from '@/lib/types';
import { Send } from 'lucide-react';
import { OTPSection } from './otp-section';
import { QuestionsSection } from './questions-section';
import { VerificationMethods } from './verification-methods';
import { GroupUrlInput } from './group-url-input';

interface CreateFormProps {
  groupUrl: string;
  setGroupUrl: (url: string) => void;
  groupUrlRef: React.MutableRefObject<string>;
  verificationMethod: VerificationMethod;
  setVerificationMethod: (method: VerificationMethod) => void;
  vertifyMethodRef: React.MutableRefObject<VerificationMethod>;
  questions: QuizQuestion[];
  setQuestions: (questions: QuizQuestion[]) => void;
  otpMethod: OTPMethod;
  setOtpMethod: (method: OTPMethod) => void;
  handleCreateSecureLink: (
    e: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  handleAddQuestion: () => void;
  handleQuestionChange: (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => void;
}

export function CreateForm({
  groupUrl,
  setGroupUrl,
  groupUrlRef,
  verificationMethod,
  setVerificationMethod,
  vertifyMethodRef,
  questions,
  setQuestions,
  otpMethod,
  setOtpMethod,
  handleCreateSecureLink,
  handleAddQuestion,
  handleQuestionChange,
}: CreateFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>انشئ رابط انضمام آمن</CardTitle>
        <CardDescription>
          ادخل رابط المجموعة وأسئلة الاختبار اللازمة للانضمام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateSecureLink}>
          <div className='space-y-6'>
            <GroupUrlInput
              groupUrl={groupUrl}
              setGroupUrl={setGroupUrl}
              groupUrlRef={groupUrlRef}
            />
            <hr className='border-border' />
            <VerificationMethods
              verificationMethod={verificationMethod}
              setVerificationMethod={setVerificationMethod}
              vertifyMethodRef={vertifyMethodRef}
            />
            {(verificationMethod === 'questions' ||
              verificationMethod === 'both') && (
              <QuestionsSection
                questions={questions}
                setQuestions={setQuestions}
                handleAddQuestion={handleAddQuestion}
                handleQuestionChange={handleQuestionChange}
              />
            )}
            {(verificationMethod === 'otp' ||
              verificationMethod === 'both') && (
              <OTPSection
                otpMethod={otpMethod}
                setOtpMethod={setOtpMethod}
                mode='create'
                setJoinLink={() => {}}
              />
            )}
          </div>
          <Button type='submit' className='mt-6 w-full md:w-1/2'>
            انشئ رابط الانضمام
            <Send className='mr-2 h-4 w-4' />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
