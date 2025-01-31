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
import { AlertCircle, Plus, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SignedIn } from '@clerk/clerk-react';
import { QuizQuestion } from '@/lib/types';
import useSecureLink from '@/hooks/useSecureLink';
import { useQuiz } from '@/hooks/useQuiz';
import { validateUrl } from '@/lib/utils';

export default function Modal({
  tokenRef,
}: {
  tokenRef: React.MutableRefObject<string>;
}) {
  const [activeTab, setActiveTab] = useState('join');
  const [groupUrl, setGroupUrl] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [joinUrl, setJoinUrl] = useState('');

  const groupUrlRef = useRef(''); // direct url
  const joinurlRef = useRef('');

  // hooks

  const { secureLink, createSecureLink } = useSecureLink(tokenRef);
  const { quiz, quizAnswers, joinLink, setQuizAnswers, checkAnswers, getQuiz } =
    useQuiz(tokenRef);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answer: '' }]);
  };

  // create secureJoin link
  const handleCreateSecureLink = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault(); // not trigger reload

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
    value: string
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
    <main className='min-h-screen w-full px-5 z-40' dir='rtl'>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full max-w-4xl mx-auto backdrop-blur-sm bg-card rounded-xl overflow-hidden'
      >
        {/* tabs */}
        <SignedIn>
          <TabsList className='grid w-full grid-cols-2 mt-2 mb-2'>
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
          <Card dir='rtl'>
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
                      placeholder='الصق رابط المجموعة هنا'
                      value={groupUrl}
                      onChange={(e) => {
                        const input = e.target.value;
                        setGroupUrl(input);
                        groupUrlRef.current = input;
                      }}
                      required
                      className='mt-1.5 border-border bg-input focus:border-primary w-full md:w-1/2'
                    />
                    {groupUrlRef.current && (
                      <div className='mt-2 text-sm text-gray-600'>
                        {validateUrl(groupUrlRef.current)
                          ? ''
                          : 'رابط غير مدعوم، يرجى استخدام رابط منصة اجتماعية أخرى'}
                      </div>
                    )}
                  </div>
                  {questions.map((q, index) => (
                    <div key={index} className='space-y-3 p-4 rounded-lg'>
                      <Label htmlFor={`question-${index}`} className='text-lg'>
                        السؤال {index + 1}
                      </Label>
                      <Input
                        id={`question-${index}`}
                        placeholder='ادخل السؤال'
                        value={q.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            'question',
                            e.target.value
                          )
                        }
                        required
                        className='mt-1.5 border-border bg-input focus:border-primary w-full md:w-1/2'
                      />
                      <Label htmlFor={`answer-${index}`} className='text-lg'>
                        الجواب
                      </Label>
                      <Input
                        id={`answer-${index}`}
                        placeholder='ادخل الجواب'
                        value={q.answer}
                        onChange={(e) =>
                          handleQuestionChange(index, 'answer', e.target.value)
                        }
                        required
                        className='mt-1.5 border-border bg-input focus:border-primaryw-full md:w-1/2'
                      />
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleAddQuestion}
                    className='w-full md:w-1/2'
                  >
                    سؤال إضافي
                    <Plus className='w-4 h-4 mr-2' />
                  </Button>
                </div>
                <Button type='submit' className='mt-6 w-full md:w-1/2'>
                  انشئ رابط الانضمام
                  <Send className='w-4 h-4 mr-2' />
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              {secureLink.length > 0 && (
                <Alert className='w-full px-12' dir='rtl'>
                  <AlertCircle className='h-4 w-4 right-4 translate-y-1/2' />
                  <AlertTitle> أُنشئ رابط الانضمام:</AlertTitle>
                  <AlertDescription className='mt-2 font-mono text-sm break-all'>
                    {secureLink}
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* join group via secureLink */}
        <TabsContent value='join'>
          <Card dir='rtl'>
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
                      className='mt-1.5 border-muted-foreground bg-input focus:border-primary w-full md:w-1/2'
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
                        className='p-4 rounded-lg flex flex-col gap-2'
                      >
                        <Label htmlFor='quizAnswer' className='text-lg font-bold'>
                          {q.question}
                        </Label>
                        <Input
                          id='quizAnswer'
                          placeholder='ادخل الجواب'
                          value={quizAnswers[index] || ''}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[index] = e.target.value;
                            setQuizAnswers(newAnswers);
                          }}
                          required
                          className='mt-1.5 border-border bg-input focus:border-primary w-1/2'
                        />
                      </div>
                    ))}
                </div>
                {quiz.length > 0 && (
                  <Button type='submit' className='mt-6 w-full md:w-1/2'>
                    انضم للمجموعة
                    <Send className='w-4 h-4 mr-2' />
                  </Button>
                )}
              </form>
            </CardContent>
            <CardFooter>
              {joinLink.length > 0 && (
                <Alert className='w-full px-12 text-white'>
                  <AlertCircle className='h-6 w-6 right-4 translate-y-1/2' color='white' />
                  <AlertTitle> انضم للمجموعة:</AlertTitle>
                  <AlertDescription className='mt-4 font-mono text-sm break-all'>
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
