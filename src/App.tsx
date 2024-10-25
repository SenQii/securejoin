import { useState, useRef, useEffect } from 'react';
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
import { AlertCircle, Lock, Unlock, Plus, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
  useAuth,
  useUser,
} from '@clerk/clerk-react';
import toast, { Toaster } from 'react-hot-toast';
import { URL } from '@/lib/constant';
// add reanimted? add some animations to the page

// to constant file
const avaliablePlatforms = ['chat.whatsapp.com', 't.me', 'ig.me'];

const toastERR = (message: string) => {
  toast.error(message);
};

interface QuizQuestion {
  question: string;
  answer: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('join');
  const [groupUrl, setGroupUrl] = useState('');
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
  const [secureJoinUrl, setSecureJoinUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  const tokenRef = useRef('');
  const currentGroupURL = useRef('');
  const secureJoinUrlref = useRef('');
  const joinurlRef = useRef('');

  const { openSignIn } = useClerk();
  const { getToken } = useAuth();
  const { user } = useUser();

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answer: '' }]);
  };

  const handleQuestionChange = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  // run at sign in
  useEffect(() => {
    // get the AT
    const get_Access_Token = async () => {
      await getToken()
        .then((token) => {
          tokenRef.current = token || '';
        })
        .catch((err) => {
          console.log('could not get token', err);
        });

      // console.log('token:', tokenRef.current);
    };

    if (user) get_Access_Token();
    else console.log('user not signed in');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateSecureJoin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // TODO: check its a social media link
    if (url_validator(groupUrl)) {
      try {
        const Res = await fetch(`${URL}/create_link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': tokenRef.current,
          },
          body: JSON.stringify({
            quiz_list: questions,
            original_url: currentGroupURL.current,
          }),
        });
        if (!Res.ok) {
          throw new Error(`Network response was not ok ${Res.status}`);
        }
        const data = await Res.json();
        onCreateLink(data);
      } catch (err) {
        console.log('could not post to server', err);
        toastERR('حدث خطأ أثناء إنشاء الرابط');
        formReset();
        setSecureJoinUrl('');
        secureJoinUrlref.current = '';
      }
    } else {
      toastERR('لم ندعم هذا الرابط بعد، يرجى استخدام رابط منصة اجتماعية أخرى');
      document
        .getElementById('groupUrl')
        ?.style.setProperty('border-color', 'red');
      document.getElementById('groupUrl')?.focus();
    }
  };

  async function check_link(link: string) {
    try {
      if (!link.includes('securejoin.com')) {
        toastERR('الرابط المدخل غير صحيح');
        document.getElementById('joinUrl')?.focus();
        return;
      }
      const response = await fetch(`${URL}/get_quiz`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'access-token': tokenRef.current,
        },
        body: JSON.stringify({
          link: link,
        }),
      });
      if (!response.ok) {
        if (response.status === 404) {
          toastERR('لا يوجد رابط مطابق');
          setSecureJoinUrl('');
          secureJoinUrlref.current = '';
          return;
        }
        throw new Error(`Network response was not ok ${response.status}`);
      }

      const data = await response.json();
      console.log('data:', data.quiz);

      setQuiz(data.quiz);
    } catch (err) {
      console.log('could not post to server', err);
      toastERR('حدث خطأ أثناء التحقق من الرابط');
      setSecureJoinUrl('');
      secureJoinUrlref.current = '';
    }
  }

  const handleJoinGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // SERVER: fetch Q, check answers & result
  };

  const url_validator = (url: string) => {
    if (avaliablePlatforms.some((platform) => url.includes(platform))) {
      return true;
    } else {
      return false;
    }
  };

  const onCreateLink = (data: {
    status: string;
    message: string;
    link?: string;
  }) => {
    console.log('data:', data);
    if (data.status === 'success') {
      // ref for real-time link, state to force re-render
      secureJoinUrlref.current = data.link || '';
      setSecureJoinUrl(secureJoinUrlref.current);
      toast.success('تم إنشاء الرابط بنجاح');
      formReset();
    } else {
      toastERR('حدث خطأ أثناء إنشاء الرابط');
      setSecureJoinUrl('');
      secureJoinUrlref.current = '';
    }
  };

  const formReset = () => {
    setGroupUrl('');
    setQuestions([{ question: '', answer: '' }]);

    document.getElementById('groupUrl')?.focus();
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-gray-50 to-white'
      dir='rtl'
    >
      <header className='bg-white shadow-sm flex flex-row'>
        <div className='container mx-auto px-4 py-6'>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
            <Lock className='w-8 h-8 ml-2 text-blue-600' />
            SecureJoin
          </h1>
          <p className='mt-2 text-lg text-gray-600'>
            أمّن مجموعتك عبر بوابة الانضمام الآمنة
          </p>
        </div>
        <div className='mx-auto flex items-center justify-center'>
          <SignedOut>
            {/* UX: on loading, play a modal note to prompte user to sign in ++++ change button  */}
            <div
              className='w-7 h-7 sm:h-10 sm:w-10 mx-auto cursor-pointer'
              onClick={() => openSignIn()}
            >
              <div className=''>
                <svg
                  version='1.1'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 48 48'
                  xmlnsXlink='http://www.w3.org/1999/xlink'
                  className='block'
                >
                  <path
                    fill='#EA4335'
                    d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
                  ></path>
                  <path
                    fill='#4285F4'
                    d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
                  ></path>
                  <path
                    fill='#FBBC05'
                    d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
                  ></path>
                  <path
                    fill='#34A853'
                    d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
                  ></path>
                  <path fill='none' d='M0 0h48v48H0z'></path>
                </svg>
              </div>
              <span className='hidden'>Sign in with Google</span>
            </div>
          </SignedOut>
          <SignedIn>
            <div className='w-7 h-7 sm:h-10 sm:w-10 mx-auto cursor-pointer'>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </header>

      <main className='container mx-auto px-4 py-12' dir='rtl'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full max-w-4xl mx-auto'
        >
          <SignedIn>
            <TabsList className='grid w-full bg grid-cols-2 mb-8'>
              <TabsTrigger value='create' className='text-lg py-3'>
                <Lock className='w-5 h-5 mr-2' />
                انشئ رابط
              </TabsTrigger>
              <TabsTrigger value='join' className='text-lg py-3'>
                <Unlock className='w-5 h-5 mr-2' />
                انضم لمجموعة عبر الرابط
              </TabsTrigger>
            </TabsList>
          </SignedIn>
          <TabsContent value='create'>
            <Card className='border-t-4 border-t-blue-600' dir='rtl'>
              <CardHeader>
                <CardTitle className='text-2xl'>انشئ رابط انضمام آمن</CardTitle>
                <CardDescription>
                  ادخل رابط المجموعة وأسئلة الاختبار اللازمة للانضمام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSecureJoin}>
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
                          currentGroupURL.current = input;
                        }}
                        required
                        className='mt-1'
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                          e.currentTarget.style.setProperty('border-color', '');
                        }}
                      />
                      {currentGroupURL.current && (
                        <div className='mt-2 text-sm text-gray-600'>
                          {url_validator(currentGroupURL.current)
                            ? ''
                            : 'رابط غير مدعوم، يرجى استخدام رابط منصة اجتماعية أخرى'}
                        </div>
                      )}
                    </div>
                    {questions.map((q, index) => (
                      <div key={index} className='space-y-3 p-4 rounded-lg'>
                        <Label
                          htmlFor={`question-${index}`}
                          className='text-lg'
                        >
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
                        />
                        <Label htmlFor={`answer-${index}`} className='text-lg'>
                          الجواب
                        </Label>
                        <Input
                          id={`answer-${index}`}
                          placeholder='ادخل الجواب'
                          value={q.answer}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              'answer',
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleAddQuestion}
                      className='w-full'
                    >
                      سؤال إضافي
                      <Plus className='w-4 h-4 mr-2' />
                    </Button>
                  </div>
                  <Button type='submit' className='mt-6 w-full'>
                    انشئ رابط الانضمام
                    <Send className='w-4 h-4 mr-2' />
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                {secureJoinUrl.length > 0 && (
                  <Alert className='w-full px-12' dir='rtl'>
                    <AlertCircle className='h-4 w-4 right-4 translate-y-1/2' />
                    <AlertTitle> أُنشئ رابط الانضمام:</AlertTitle>
                    <AlertDescription className='mt-2 font-mono text-sm break-all'>
                      {secureJoinUrlref.current}
                    </AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value='join'>
            <Card className='border-t-4 border-t-green-600' dir='rtl'>
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
                        placeholder='الصق رابط الانضمام هنا'
                        value={joinUrl}
                        onChange={(e) => {
                          setJoinUrl(e.target.value);
                          joinurlRef.current = e.target.value;
                        }}
                        required
                        className='mt-1'
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
                        className='mt-6 md:w-1/2 w-full'
                        onClick={() => check_link(joinurlRef.current)}
                      >
                        تحقق من الرابط
                      </Button>
                    </div>
                    {/* In a real app, you would fetch questions based on the Secure Join URL */}
                    {quiz.length > 0 &&
                      quiz.map((q, index) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-100 rounded-lg flex flex-col gap-2'
                        >
                          <Label htmlFor='quizAnswer' className='text-lg'>
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
                          />
                        </div>
                      ))}
                  </div>
                  {quiz.length > 0 && (
                    <Button type='submit' className='mt-6 w-full'>
                      انضم للمجموعة
                      <Send className='w-4 h-4 mr-2' />
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
