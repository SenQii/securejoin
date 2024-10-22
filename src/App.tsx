import { useState } from 'react';
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
// TODO: Clerk integration

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [groupUrl, setGroupUrl] = useState('');
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
  const [secureJoinUrl, setSecureJoinUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [quizAnswers, setQuizAnswers] = useState([]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answer: '' }]);
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleCreateSecureJoin = (e: React.FormEvent<HTMLFormElement>) => {
    // TODO: check its a social media link
    // instade:  post to server **
    e.preventDefault();
    setSecureJoinUrl(
      `https://securejoin.com/${Math.random().toString(36).substring(2, 11)}`
    );
  };

  const handleJoinGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // SERVER: fetch Q, check answers & result
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-gray-50 to-white'
      dir='rtl'
    >
      <header className='bg-white shadow-sm'>
        <div className='container mx-auto px-4 py-6'>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
            <Lock className='w-8 h-8 ml-2 text-blue-600' />
            SecureJoin
          </h1>
          <p className='mt-2 text-lg text-gray-600'>
            أمّن مجموعتك عبر بوابة الانضمام الآمنة
          </p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-12' dir='rtl'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full max-w-4xl mx-auto'
        >
          <TabsList className='grid w-full grid-cols-2 mb-8'>
            {/* Create Link Only for authintcaated users *** considring use Clerk? */}
            <TabsTrigger value='create' className='text-lg py-3'>
              <Lock className='w-5 h-5 mr-2' />
              انشئ رابط
            </TabsTrigger>
            <TabsTrigger value='join' className='text-lg py-3'>
              <Unlock className='w-5 h-5 mr-2' />
              انضم لمجموعة عبر الرابط
            </TabsTrigger>
          </TabsList>
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
                      {/* UX: add indecator to display platform's name / icon by reading the url */}
                      <Label htmlFor='groupUrl' className='text-lg'>
                        رابط المجموعة
                      </Label>
                      <Input
                        id='groupUrl'
                        placeholder='الصق رايط المجموعة هنا'
                        value={groupUrl}
                        onChange={(e) => setGroupUrl(e.target.value)}
                        required
                        className='mt-1'
                      />
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
                {secureJoinUrl && (
                  <Alert className='w-full px-12' dir='rtl'>
                    <AlertCircle className='h-4 w-4 right-4 translate-y-1/2' />
                    <AlertTitle> أُنشئ رابط الانضمام:</AlertTitle>
                    <AlertDescription className='mt-2 font-mono text-sm break-all'>
                      {secureJoinUrl}
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
                <CardDescription className='text-xs'>
                  يبدأ الرابط بـ<code>https://securejoin.com</code>
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
                        placeholder='الصق رابط الانضمام هنا'
                        value={joinUrl}
                        onChange={(e) => setJoinUrl(e.target.value)}
                        required
                        className='mt-1'
                      />
                    </div>
                    {/* In a real app, you would fetch questions based on the Secure Join URL */}
                    <div className='p-4 bg-gray-100 rounded-lg flex flex-col gap-2'>
                      <Label htmlFor='quizAnswer' className='text-lg'>
                        ما ناتج 2 + 2؟
                      </Label>
                      <Input
                        id='quizAnswer'
                        placeholder='ادخل الجواب'
                        value={quizAnswers[0] || ''}
                        onChange={(e) => setQuizAnswers([e.target.value])}
                        required
                      />
                    </div>
                  </div>
                  <Button type='submit' className='mt-6 w-full'>
                    انضم للمجموعة
                    <Send className='w-4 h-4 mr-2' />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
