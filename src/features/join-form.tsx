import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send } from 'lucide-react';
import { OTPSection } from './otp-section';
import { QuizQuestion, OTPMethod } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface JoinFormProps {
  joinUrl: string;
  setJoinUrl: (url: string) => void;
  joinurlRef: React.MutableRefObject<string>;
  quiz: QuizQuestion[];
  quizAnswers: string[];
  setQuizAnswers: (answers: string[]) => void;
  handleJoinGroup: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerifyLink: () => Promise<void>;
  hasOTP: boolean;
  verificationMethod: string[];
  OTPmethod: OTPMethod;
  setOTPmethod: (method: OTPMethod) => void;
  otpContact: string;
  setOtpContact: (contact: string) => void;
}

export function JoinForm({
  joinUrl,
  setJoinUrl,
  joinurlRef,
  quiz,
  quizAnswers,
  setQuizAnswers,
  handleJoinGroup,
  handleVerifyLink,
  hasOTP,
  verificationMethod,
  OTPmethod,
  setOTPmethod,
  otpContact,
  setOtpContact,
}: JoinFormProps) {
  console.log('method', verificationMethod);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>ادخل مجموعة بامان</CardTitle>
        <CardDescription>
          ادخل رابط الانضمام الآمن للانضمام للمجموعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinGroup}>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='joinUrl' className='text-lg'>
                رابط الانضمام الآمن
              </Label>
              <Input
                id='joinUrl'
                placeholder='https://securejoin.com/xxxxx'
                value={joinUrl}
                onChange={(e) => {
                  setJoinUrl(e.target.value);
                  joinurlRef.current = e.target.value;
                }}
                required
                className='mt-1.5 w-full border-muted-foreground bg-input focus:border-primary md:w-1/2'
              />
              {joinurlRef.current && (
                <div className='mt-2 text-sm text-gray-600'>
                  {joinurlRef.current.includes('https://securejoin.com')
                    ? ''
                    : 'رابط غير مدعوم، يجب أن بدأ الرابط بـ https://securejoin.com'}
                </div>
              )}
              <Button
                type='button'
                className='mt-6 w-full md:w-1/2'
                onClick={handleVerifyLink}
              >
                تحقق من الرابط
              </Button>
            </div>

            {verificationMethod.includes('QUESTIONS') &&
              quiz.length > 0 &&
              quiz.map((q, index) => (
                <div
                  key={index}
                  className='flex flex-col gap-2 rounded-lg border p-4'
                >
                  <Label htmlFor='quizAnswer' className='text-lg font-bold'>
                    {q.question}
                  </Label>

                  {q.questionType === 'text' ? (
                    <Input
                      id='quizAnswer'
                      placeholder='ادخل الجواب'
                      value={quizAnswers[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = e.target.value;
                        setQuizAnswers(newAnswers);
                      }}
                      required
                      className='mt-1.5 w-1/2 border-border bg-input focus:border-primary'
                    />
                  ) : (
                    <RadioGroup
                      value={quizAnswers[index] || ''}
                      onValueChange={(value) => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = value;
                        setQuizAnswers(newAnswers);
                      }}
                      className='flex flex-col gap-2'
                    >
                      {q.options?.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className='flex items-center gap-2'
                        >
                          <RadioGroupItem
                            value={option.label}
                            id={`q${index}-opt${optionIndex}`}
                          />
                          <Label htmlFor={`q${index}-opt${optionIndex}`}>
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}

            {(hasOTP || verificationMethod.includes('OTP')) && (
              <OTPSection
                otpMethod={OTPmethod}
                setOtpMethod={setOTPmethod}
                otpContact={otpContact}
                setOtpContact={setOtpContact}
                mode='join'
              />
            )}
          </div>
          {quiz.length > 0 && (
            <Button type='submit' className='mt-6 w-full md:w-1/2'>
              انضم للمجموعة
              <Send className='mr-2 h-4 w-4' />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
