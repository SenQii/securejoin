import React, { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Send, MessageSquare, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SignedIn } from '@clerk/clerk-react';
import { OTPMethod, QuizQuestion, VerificationMethod } from '@/lib/types';
import useSecureLink from '@/hooks/useSecureLink';
import { useQuiz } from '@/hooks/useQuiz';
import { cn, validateUrl } from '@/lib/utils';
import { OTPSection } from '@/features/otp-section';
import { QuestionsSection } from '@/features/questions-section';

export default function Modal({
  tokenRef,
}: {
  tokenRef: React.MutableRefObject<string>;
}) {
  const [activeTab, setActiveTab] = useState('join');
  const [groupUrl, setGroupUrl] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: '', answer: '' },
  ]);
  const [joinUrl, setJoinUrl] = useState('');
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>('questions');
  const [otpMethod, setOtpMethod] = useState<OTPMethod>('phone');
  const [otpContact, setOtpContact] = useState('');

  const groupUrlRef = useRef(''); // direct url
  const joinurlRef = useRef('');

  // hooks

  const { secureLink, createSecureLink } = useSecureLink(tokenRef);
  const { quiz, quizAnswers, joinLink, setQuizAnswers, checkAnswers, getQuiz } =
    useQuiz(tokenRef);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answer: '' }]);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Verify at least one method is selected
    if (!verificationMethod) {
      newErrors.method = 'يجب اختيار طريقة تحقق واحدة على الأقل';
    }

    // Validate OTP if selected
    if (verificationMethod === 'otp' || verificationMethod === 'both') {
      if (!otpContact) {
        newErrors.otpContact =
          otpMethod === 'email'
            ? 'يرجى إدخال البريد الإلكتروني'
            : 'يرجى إدخال رقم الهاتف';
      } else if (
        otpMethod === 'email' &&
        !otpContact.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ) {
        newErrors.otpContact = 'يرجى إدخال بريد إلكتروني صحيح';
      } else if (
        otpMethod === 'phone' &&
        !otpContact.match(/^\+?[\d\s-]{8,}$/)
      ) {
        newErrors.otpContact = 'يرجى إدخال رقم هاتف صحيح';
      }
    }

    // Validate questions if selected
    if (verificationMethod === 'questions' || verificationMethod === 'both') {
      if (questions.length === 0) {
        newErrors.questions = 'يجب إضافة سؤال واحد على الأقل';
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // create secureJoin link
  const handleCreateSecureLink = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await createSecureLink(questions, groupUrlRef.current);
    if (success) formReset(); // double check
  };

  // join via secureLink
  const handleJoinGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await checkAnswers(joinurlRef.current);
  };

  // update Qs
  const handleQuestionChange = (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const formReset = () => {
    setGroupUrl('');
    setQuestions([{ question: '', answer: '' }]);

    document.getElementById('groupUrl')?.focus();
  };

  return (
    <main className='z-40 min-h-screen w-full px-5' dir='rtl'>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='mx-auto w-full max-w-4xl overflow-hidden rounded-xl bg-card backdrop-blur-sm'
      >
        {/* tabs */}
        <SignedIn>
          <TabsList className='mb-2 mt-2 grid w-full grid-cols-2'>
            <TabsTrigger value='create' className='text-sm md:text-lg'>
              انشئ رابط انضمام
            </TabsTrigger>
            <TabsTrigger value='join' className='text-sm md:text-lg'>
              انضم عبر رابط آمن
            </TabsTrigger>
          </TabsList>
        </SignedIn>

        {/* create secureLink */}
        <TabsContent value='create'>
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
                  <div>
                    {/* UX: add indicator to display platform's name / icon by reading the url */}
                    <Label htmlFor='groupUrl' className='text-lg'>
                      رابط المجموعة
                    </Label>
                    <Input
                      id='groupUrl'
                      placeholder='https://chat.whatsapp.com/xxxxx'
                      value={groupUrl}
                      onChange={(e) => {
                        const input = e.target.value;
                        setGroupUrl(input);
                        groupUrlRef.current = input;
                      }}
                      required
                      className='mt-1.5 w-full border-border bg-input focus:border-primary md:w-1/2'
                    />
                    {/* in-time check */}
                    {groupUrlRef.current && (
                      <div className='mt-2 text-sm text-gray-600'>
                        {validateUrl(groupUrlRef.current)
                          ? ''
                          : 'رابط غير مدعوم، يرجى استخدام رابط منصة اجتماعية أخرى'}
                      </div>
                    )}
                  </div>
                  <hr className='border-border' />
                  <div className='space-y-6'>
                    <div className='space-y-4'>
                      <Label className='text-lg'>طريقة التحقق</Label>
                      <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                        <div
                          className={cn(
                            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                            verificationMethod === 'questions'
                              ? 'border-primary bg-primary/10'
                              : 'hover:border-primary/50',
                          )}
                          onClick={() => setVerificationMethod('questions')}
                        >
                          <div className='rounded-full bg-primary/20 p-2'>
                            <AlertCircle className='h-6 w-6 text-primary' />
                          </div>
                          <span>أسئلة التحقق</span>
                        </div>

                        <div
                          className={cn(
                            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                            verificationMethod === 'otp'
                              ? 'border-primary bg-primary/10'
                              : 'hover:border-primary/50',
                          )}
                          onClick={() => setVerificationMethod('otp')}
                        >
                          <div className='rounded-full bg-primary/20 p-2'>
                            <MessageSquare className='h-6 w-6 text-primary' />
                          </div>
                          <span>رمز التحقق</span>
                        </div>

                        <div
                          className={cn(
                            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                            verificationMethod === 'both'
                              ? 'border-primary bg-primary/10'
                              : 'hover:border-primary/50',
                          )}
                          onClick={() => setVerificationMethod('both')}
                        >
                          <div className='rounded-full bg-primary/20 p-2'>
                            <ShieldCheck className='h-6 w-6 text-primary' />
                          </div>
                          <span>كلاهما</span>
                        </div>
                      </div>
                    </div>
                    {/* OTP */}
                    {(verificationMethod == 'otp' ||
                      verificationMethod == 'both') && (
                      <OTPSection
                        otpMethod={otpMethod as OTPMethod}
                        setOtpMethod={setOtpMethod}
                        otpContact={otpContact}
                        setOtpContact={setOtpContact}
                      />
                    )}

                    {/* Questions Section */}
                    {(verificationMethod === 'questions' ||
                      verificationMethod === 'both') && (
                      <QuestionsSection
                        questions={questions}
                        setQuestions={setQuestions}
                        handleAddQuestion={handleAddQuestion}
                        handleQuestionChange={handleQuestionChange}
                      />
                    )}
                  </div>
                </div>
                <Button type='submit' className='mt-6 w-full md:w-1/2'>
                  انشئ رابط الانضمام
                  <Send className='mr-2 h-4 w-4' />
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              {secureLink.length > 0 && (
                <Alert className='w-full px-12' dir='rtl'>
                  <AlertCircle className='right-4 h-4 w-4 translate-y-1/2' />
                  <AlertTitle> أُنشئ رابط الانضمام:</AlertTitle>
                  <AlertDescription className='mt-2 break-all font-mono text-sm'>
                    {secureLink}
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* join group via secureLink */}
        <TabsContent value='join'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>ادخل مجموعة بامان</CardTitle>
              <CardDescription>
                ادخل رابط الانضمام الآمن للانضمام للمجموعة
              </CardDescription>
              <CardDescription className='text-xs'></CardDescription>
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
                      onClick={() => getQuiz(joinurlRef.current)}
                    >
                      تحقق من الرابط
                    </Button>
                  </div>
                  {/* In a real app, you would fetch questions based on the Secure Join URL */}
                  {quiz.length > 0 &&
                    quiz.map((q, index) => (
                      <div
                        key={index}
                        className='flex flex-col gap-2 rounded-lg p-4'
                      >
                        <Label
                          htmlFor='quizAnswer'
                          className='text-lg font-bold'
                        >
                          {q.question}
                        </Label>
                        <Input
                          id='quizAnswer'
                          placeholder='ادخل الجواب'
                          value={quizAnswers[index] || ''}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[index] = e.target.value;
                            setQuizAnswers(newAnswers);
                          }}
                          required
                          className='mt-1.5 w-1/2 border-border bg-input focus:border-primary'
                        />
                      </div>
                    ))}
                </div>
                {quiz.length > 0 && (
                  <Button type='submit' className='mt-6 w-full md:w-1/2'>
                    انضم للمجموعة
                    <Send className='mr-2 h-4 w-4' />
                  </Button>
                )}
              </form>
            </CardContent>
            <CardFooter>
              {joinLink.length > 0 && (
                <Alert className='w-full px-12 text-white'>
                  <AlertCircle
                    className='right-4 h-6 w-6 translate-y-1/2'
                    color='white'
                  />
                  <AlertTitle> انضم للمجموعة:</AlertTitle>
                  <AlertDescription className='mt-4 break-all font-mono text-sm'>
                    <a href={joinLink}>{joinLink}</a>
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
