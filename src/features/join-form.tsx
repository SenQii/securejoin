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
import { AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { OTPSection } from './otp-section';
import { OTPMethod, QuizQuestion } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface JoinFormProps {
  joinLink: string;
  joinurlRef: React.MutableRefObject<string>;
  quiz: QuizQuestion[];
  quizAnswers: string[];
  setQuizAnswers: (answers: string[]) => void;
  handleJoinGroup: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  hasOTP: boolean;
  handleVerifyLink: () => Promise<boolean>;
  verificationMethod: string[];
  otpMethod: OTPMethod;
  otpContact: string;
  setOtpContact: (contact: string) => void;
  isLinkVerified: boolean;
  setIsLinkVerified: (value: boolean) => void;
  quiz_id: string;
}

export function JoinForm({
  joinLink,
  joinurlRef,
  quiz,
  quizAnswers,
  setQuizAnswers,
  handleJoinGroup,
  hasOTP,
  handleVerifyLink,
  verificationMethod,
  otpMethod,
  isLinkVerified,
  setIsLinkVerified,
  quiz_id,
}: JoinFormProps) {
  const [secureLink, setSecureLink] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLinkVerified) {
      const valid_url = await handleVerifyLink();
      if (!valid_url) {
        toast.error('رابط غير صحيح، حاول مرة أخرى');
        return;
      }
      toast.success('تم التحقق من الرابط بنجاح');
      setIsLinkVerified(true);
      return;
    }
    await handleJoinGroup(e);
  };

  const handleOTPSuccess = (directLink?: string) => {
    if (directLink) {
    }
  };

  useEffect(() => {
    const fullURL = window.location.href; // get the full url
    const extras = window.location.pathname.substring(1); // get the path

    //  if ther is no path, dont fill
    if (!extras) return;

    if (fullURL) {
      setSecureLink(fullURL);
      handleJoin(fullURL);
    }
  }, [location]);

  const handleJoin = (fullURL: string) => {
    console.log('Joining with:', fullURL);
    // Fetch quiz data using the codename
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>ادخل مجموعة بامان</CardTitle>
        <CardDescription>
          ادخل رابط الانضمام الآمن للانضمام للمجموعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} autoComplete='off'>
          <div className='space-y-6'>
            {!isLinkVerified && (
              <div>
                <Label htmlFor='joinUrl' className='text-lg'>
                  رابط الانضمام الآمن
                </Label>
                <Input
                  id='joinUrl'
                  placeholder='https://securejoin.vercel.app/xxxxx'
                  value={secureLink}
                  onChange={(e) => {
                    setSecureLink(e.target.value);
                    joinurlRef.current = e.target.value;
                  }}
                  required
                  disabled={isLinkVerified}
                  className='mt-1.5 w-full border-muted-foreground bg-input focus:border-primary md:w-1/2'
                />
                {joinurlRef.current && (
                  <div className='mt-2 text-sm text-gray-600'>
                    {joinurlRef.current.includes(
                      'https://securejoin.vercel.app',
                    )
                      ? ''
                      : 'رابط غير صحيح، يجب أن بدأ الرابط بـ https://securejoin.vercel.app'}
                  </div>
                )}
                <Button type='submit' className='mt-6 w-full md:w-1/2'>
                  تحقق من الرابط
                </Button>
              </div>
            )}

            {isLinkVerified && (
              <>
                {/* Success Message */}
                <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border border-green-200 bg-green-50 p-6'>
                  <CheckCircle2 className='h-12 w-12 text-green-500' />
                  <p className='text-center text-lg font-medium text-green-700'>
                    تم التحقق من الرابط بنجاح
                  </p>
                </div>

                {/* Verification Methods */}
                {(verificationMethod.includes('QUESTIONS') ||
                  verificationMethod.includes('BOTH')) &&
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
                    mode='join'
                    onVerificationSuccess={handleOTPSuccess}
                    otpMethod={otpMethod}
                    quiz_id={quiz_id}
                  />
                )}

                {/* Show join button only when needed */}
                {!joinLink && verificationMethod.includes('QUESTIONS') && (
                  <Button type='submit' className='mt-6 w-full md:w-1/2'>
                    انضم للمجموعة
                    <Send className='mr-2 h-4 w-4' />
                  </Button>
                )}

                {joinLink && (
                  <Alert className='mt-4 bg-card px-12' dir='rtl'>
                    <AlertCircle className='right-4 h-4 w-4 translate-y-1/2' />
                    <AlertTitle>رابط الانضمام:</AlertTitle>
                    <AlertDescription className='mt-2 flex w-full items-center justify-center bg-red-200 font-mono text-sm'>
                      <Button variant={'link'} className='w-full' type='button'>
                        {joinLink}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
