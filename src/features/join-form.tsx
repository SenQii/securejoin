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
import { Send, Loader2 } from 'lucide-react';
import { OTPSection } from './otp-section';
import { OTPMethod, QuizQuestion } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AttemptManager } from '@/lib/attempt-manager';
import { useID } from '@/hooks/useID';

interface JoinFormProps {
  joinLink: string;
  setJoinLink: (link: string) => void;
  joinurlRef: React.MutableRefObject<string>;
  quiz: QuizQuestion[];
  quizAnswers: string[];
  setQuizAnswers: (answers: string[]) => void;
  handleJoinGroup: (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>;
  hasOTP: boolean;
  handleVerifyLink: () => Promise<boolean>;
  verificationMethod: string[];
  otpMethod: OTPMethod;
  isLinkVerified: boolean;
  setIsLinkVerified: (value: boolean) => void;
  quiz_id: string;
  isOtpVerified: boolean;
  setIsOtpVerified: (value: boolean) => void;
}

export function JoinForm({
  joinLink,
  setJoinLink,
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
  isOtpVerified,
  setIsOtpVerified,
}: JoinFormProps) {
  const [secureLink, setSecureLink] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );
  const [isBanned, setIsBanned] = useState(false);
  const [banHours, setBanHours] = useState<number | null>(null);
  const ip = useID();

  useEffect(() => {
    const checkRateLimit = () => {
      if (ip) {
        const attempts = AttemptManager.getRemainingAttempts(ip);
        setRemainingAttempts(attempts);
      }
    };
    checkRateLimit();
  }, [ip]);

  useEffect(() => {
    const checkBanStatus = () => {
      if (ip) {
        const banned = AttemptManager.isBanned(ip);
        setIsBanned(banned);
        if (banned) {
          const banData = AttemptManager.getBanInfo(ip);
          setBanHours(banData?.remainingHours || null);
        } else {
          setBanHours(null);
        }
      }
    };
    checkBanStatus();
  }, [ip]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ip) {
      toast.error('جاري تحميل النظام...');
      return;
    }

    if (isBanned) {
      toast.error(`تم حظرك من النظام لمدة ${banHours} ساعة`);
      return;
    }

    if (!isLinkVerified) {
      setIsVerifying(true);
      try {
        const valid_url = await handleVerifyLink();
        if (!valid_url) {
          AttemptManager.recordAttempt(ip);
          const attempts = AttemptManager.getRemainingAttempts(ip);
          setRemainingAttempts(attempts);
          toast.error('رابط غير صحيح، حاول مرة أخرى');
          return;
        }
        toast.success('تم التحقق من الرابط بنجاح');
        setIsLinkVerified(true);
        return;
      } catch (e) {
        AttemptManager.recordAttempt(ip);
        const attempts = AttemptManager.getRemainingAttempts(ip);
        setRemainingAttempts(attempts);
        toast.error('حدث خطأ أثناء التحقق من الرابط');
        console.log('error in verifying: ', e);
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    try {
      const userPassed = await handleJoinGroup(e);

      if (!userPassed) {
        AttemptManager.recordAttempt(ip);
        const attempts = AttemptManager.getRemainingAttempts(ip);
        setRemainingAttempts(attempts);
      }
    } catch (error) {
      AttemptManager.recordAttempt(ip);
      const attempts = AttemptManager.getRemainingAttempts(ip);
      setRemainingAttempts(attempts);
      toast.error('حدث خطأ أثناء التحقق من الرابط');
      console.log('error in submitting: ', error);
    }
  };

  useEffect(() => {
    const fullURL = window.location.href; // get the full url
    const extras = window.location.pathname.substring(1); // get the path

    //  if ther is no path, dont fill
    if (!extras) return;

    const cleanedExtras = extras.trim();
    if (fullURL) {
      const finalURL = `https://securejoin.vercel.app/${cleanedExtras}`;
      setSecureLink(finalURL);
      joinurlRef.current = finalURL;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>ادخل مجموعة بامان</CardTitle>
        <CardDescription>
          {isLinkVerified && remainingAttempts !== null ? (
            <div
              className='mt-2 text-sm text-muted-foreground'
              style={isBanned ? { color: 'red' } : {}}
            >
              عدد المحاولات المتبقية: {remainingAttempts}
            </div>
          ) : (
            'ادخل رابط الانضمام الآمن للانضمام للمجموعة'
          )}
          {isBanned && (
            <div
              className='mt-2 text-sm text-muted-foreground'
              style={{ color: 'red' }}
            >
              متبقي على نهاية الحظر {banHours} ساعة
            </div>
          )}
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
                    const newV = e.target.value.trim();
                    setSecureLink(newV);
                    joinurlRef.current = newV;
                  }}
                  required
                  disabled={isLinkVerified || isVerifying}
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
                <Button
                  type='submit'
                  className='mt-6 w-full md:w-1/2'
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      جاري التحقق...
                    </>
                  ) : (
                    'تحقق من الرابط'
                  )}
                </Button>
              </div>
            )}

            {isLinkVerified && quiz && (
              <>
                {quiz.map((question, index) => (
                  <div key={index} className='space-y-2'>
                    <Label>{question.question}</Label>
                    {question.questionType === 'mcq' && question.options ? (
                      <RadioGroup
                        value={quizAnswers[index] || ''}
                        onValueChange={(value) => {
                          const newAnswers = [...quizAnswers];
                          newAnswers[index] = value;
                          setQuizAnswers(newAnswers);
                        }}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className='flex items-center space-x-2'
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
                    ) : (
                      <Input
                        value={quizAnswers[index] || ''}
                        onChange={(e) => {
                          const newAnswers = [...quizAnswers];
                          newAnswers[index] = e.target.value;
                          setQuizAnswers(newAnswers);
                        }}
                      />
                    )}
                  </div>
                ))}

                {(hasOTP || verificationMethod.includes('OTP')) && (
                  <OTPSection
                    mode='join'
                    otpMethod={otpMethod}
                    quiz_id={quiz_id}
                    setJoinLink={setJoinLink}
                    onlyOTP={
                      verificationMethod.includes('OTP') &&
                      !verificationMethod.includes('QUESTIONS')
                    }
                    onVerificationSuccess={() => setIsOtpVerified(true)}
                  />
                )}

                {!joinLink && verificationMethod.includes('QUESTIONS') && (
                  <Button
                    type='submit'
                    className='mt-6 w-full md:w-1/2'
                    disabled={
                      verificationMethod.includes('OTP') && !isOtpVerified
                    }
                  >
                    {verificationMethod.includes('OTP')
                      ? isOtpVerified
                        ? 'تحقق من الإجابات'
                        : 'يرجى التحقق من رمز التحقق أولاً'
                      : 'تحقق من الإجابات'}
                  </Button>
                )}

                {joinLink && (
                  <div className='mt-4 flex flex-col items-center gap-2'>
                    <Button
                      variant='default'
                      className='mt-6 w-full md:w-1/2'
                      onClick={() => window.open(joinLink, '_blank')}
                      type='button'
                    >
                      انضم للمجموعة
                      <Send className='mr-2 h-4 w-4' />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
