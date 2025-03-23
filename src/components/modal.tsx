import React, { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SignedIn } from '@clerk/clerk-react';
import { QuizQuestion, VerificationMethod } from '@/lib/types';
import useSecureLink from '@/hooks/useSecureLink';
import { useQuiz } from '@/hooks/useQuiz';
import { CreateForm } from '@/features/create-form';
import { JoinForm } from '@/features/join-form';

export default function Modal({
  tokenRef,
}: {
  tokenRef: React.MutableRefObject<string>;
}) {
  const [activeTab, setActiveTab] = useState('join');
  const [groupUrl, setGroupUrl] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: '', answer: '', questionType: 'text' },
  ]);
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>('questions');
  const [otpContact, setOtpContact] = useState('');
  const [isLinkVerified, setIsLinkVerified] = useState(false);

  const groupUrlRef = useRef(''); // direct url
  const joinurlRef = useRef('');
  const vertifyMethodRef = useRef<VerificationMethod>('questions');
  const OTPref = useRef(false);

  // hooks

  const { secureLink, createSecureLink } = useSecureLink(tokenRef);
  const {
    quiz,
    quizAnswers,
    setQuizAnswers,
    checkAnswers,
    getQuiz,
    verificationMethods,
    otpMethod,
    joinLink,
    setOtpMethod,
  } = useQuiz(tokenRef);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', answer: '', questionType: 'text' },
    ]);
  };

  const handleQuestionChange = (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleCreateSecureLink = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    console.log('Current verification method:', vertifyMethodRef.current); // Debug log
    const success = await createSecureLink(
      vertifyMethodRef.current,
      questions,
      groupUrlRef.current,
      otpMethod,
    );
    if (success) {
      setGroupUrl('');
      setQuestions([{ question: '', answer: '', questionType: 'text' }]);
      document.getElementById('groupUrl')?.focus();
    }
  };

  // join via secureLink
  const handleJoinGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verificationMethod == 'otp' || verificationMethod == 'both') {
      // TODO: Implement OTP verification
    }
    await checkAnswers(joinurlRef.current);
  };

  const handleVerifyLink = async (): Promise<boolean> => {
    const success = await getQuiz(joinurlRef.current);
    if (success) {
      OTPref.current = verificationMethods.includes('OTP');
    }
    return success;
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
          <CreateForm
            groupUrl={groupUrl}
            setGroupUrl={setGroupUrl}
            groupUrlRef={groupUrlRef}
            verificationMethod={verificationMethod}
            setVerificationMethod={setVerificationMethod}
            vertifyMethodRef={vertifyMethodRef}
            questions={questions}
            setQuestions={setQuestions}
            otpMethod={otpMethod}
            setOtpMethod={setOtpMethod}
            handleCreateSecureLink={handleCreateSecureLink}
            handleAddQuestion={handleAddQuestion}
            handleQuestionChange={handleQuestionChange}
          />
          {secureLink.length > 0 && (
            <Alert className='m-6 bg-card px-12' dir='rtl'>
              <AlertCircle className='right-4 h-4 w-4 translate-y-1/2' />
              <AlertTitle>أُنشئ رابط الانضمام:</AlertTitle>
              <AlertDescription className='mt-2 break-all font-mono text-sm'>
                {secureLink}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* join group via secureLink */}
        <TabsContent value='join'>
          <JoinForm
            joinLink={joinLink}
            joinurlRef={joinurlRef}
            quiz={quiz}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            handleJoinGroup={handleJoinGroup}
            handleVerifyLink={handleVerifyLink}
            verificationMethod={verificationMethods}
            hasOTP={OTPref.current}
            otpMethod={otpMethod}
            otpContact={otpContact}
            setOtpContact={setOtpContact}
            isLinkVerified={isLinkVerified}
            setIsLinkVerified={setIsLinkVerified}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
