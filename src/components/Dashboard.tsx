import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

import { useAuth } from '@clerk/clerk-react';

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { type ChartConfig } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { URL } from '@/lib/constant';
import {
  ChartBar,
  CheckCircle,
  CircleXIcon,
  ClipboardList,
  Trash,
} from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const getChartConfig = (quizzes: Quiz[]) => {
  const colors = ['#204fb4', '#3b82f6', '#60a5fa', '#5f84e9', '#145aaf'];
  return quizzes.reduce((config, quiz, index) => {
    const shortId = quiz.id.split('-')[0];
    config[quiz.id] = {
      label: `${shortId} محاولات ناجحة`,
      color: colors[index % colors.length],
    };
    return config;
  }, {} as ChartConfig);
};

type Quiz = {
  id: string;
  ownerId: string;
  url: string;
  groupName?: string;
  original_url: string;
  OTPmethod?: string;
  lastAttemptAt?: string;
  attempts_log: {
    date: string;
    attempts: number;
    success_attempts: number;
  }[];
  status: 'active' | 'inactive';
};

function Dashboard() {
  const { getToken } = useAuth();
  const [token, setToken] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const handleExpandClick = (id: string) => {
    setExpandedQuiz((prev) => (prev === id ? null : id)); // Toggle expansion
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm(`هل أنت متأكد أنك تريد حذف هذا الاختبار؟: ${id}`)) return;

    console.log('Deleting quiz:', id);

    setLoadingQuizId(id);
    try {
      const res = await fetch(`${URL}/delete_quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': `Bearer ${token}`,
        },
        body: JSON.stringify({ quiz_id: id }),
      });

      if (!res.ok) {
        console.error('Failed to delete quiz:');
        alert('حدث خطأ أثناء الحذف، حاول مرة أخرى.');
        return;
      }

      // Remove the deleted quiz from state
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('حدث خطأ أثناء الحذف، حاول مرة أخرى.');
    } finally {
      setLoadingQuizId(null);
    }
  };

  const handleToggleQuizStatus = async (
    id: string,
    status: 'activate' | 'deactivate',
  ) => {
    // APT

    console.log('Toggling quiz status:', id, status);

    try {
      const response = await fetch(`${URL}/toggle_quiz_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': `Bearer ${token}`,
        },
        body: JSON.stringify({ quiz_id: id, status }),
      });

      // check res
      if (!response.ok) {
        console.error('Failed to toggle quiz status:', response.statusText);
        toast.error('حدث خطأ أثناء تغيير الحالة، حاول مرة أخرى.');
        return;
      }

      // update
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.id === id
            ? {
                ...quiz,
                status: quiz.status === 'active' ? 'inactive' : 'active',
              }
            : quiz,
        ),
      );
      toast.success('تم تغيير الحالة بنجاح');
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
    }
  };

  // run at sign in
  useEffect(() => {
    const get_Access_Token = async () => {
      await getToken()
        .then((token) => {
          if (token) setToken(token);
        })
        .catch((err) => {
          console.log('could not get token', err);
        });
    };
    // get the AT
    get_Access_Token();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`${URL}/get_user_quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setQuizzes(data.quiz);
        } else {
          console.error('Error fetching quizzes:', data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const processChartData = (quizzes: Quiz[]) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 29); //last 30Day

    const formatDateKey = (date: Date) =>
      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

    // Create array of all days in target month
    const allDates: string[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return formatDateKey(date);
    });

    type DataPoint = {
      date: string;
      [key: string]: number | string;
    };

    // init data w zeros
    const chartData: DataPoint[] = allDates.map((date) => {
      const dataPoint: DataPoint = { date };
      quizzes.forEach((quiz) => {
        dataPoint[quiz.id] = 0;
      });
      return dataPoint;
    });

    // fill in actual data
    quizzes.forEach((quiz) => {
      if (!quiz.attempts_log) return;

      quiz.attempts_log.forEach((log) => {
        const logDate = new Date(log.date);

        // Only process data from target month and year
        if (logDate >= startDate && logDate <= now) {
          const dateKey = formatDateKey(logDate);
          const dataPoint = chartData.find((d) => d.date === dateKey);
          if (dataPoint) {
            dataPoint[quiz.id] =
              (dataPoint[quiz.id] as number) + log.success_attempts;
          }
        }
      });
    });

    return chartData;
  };

  // grant access to the dashboard
  if (!token)
    return (
      <main className='gap-5px-5 z-40 flex h-full w-full flex-col items-center justify-center'>
        <div className='flex h-72 w-full flex-col items-center justify-center gap-24 bg-background p-24'>
          <div className='flex h-64 w-1/2 items-center justify-evenly bg-background text-center'>
            <p className='text-4xl font-bold text-secondary'>غير مصرح</p>
            <div className='border-l-3 h-1/2 border border-secondary' />
            <code className='text-4xl font-bold text-secondary'>401</code>
          </div>
          <p className='text-secondary'>
            يلزمك تسجيل الدخول للوصول إلى هذه الصفحة
          </p>
        </div>
      </main>
    );

  return (
    <main
      className='z-40 flex min-h-screen w-full flex-col items-center gap-5 px-5'
      dir='rtl'
    >
      <div className='flex w-full max-w-4xl flex-col items-center justify-center gap-5 sm:flex-row'>
        {/* Overview Section */}
        <Card className='w-full max-w-4xl overflow-hidden rounded-xl bg-card backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='text-2xl'>لمحة عامة</CardTitle>
            <CardDescription>
              المحاولات الناجحة خلال آخر 30 يومًا
            </CardDescription>
          </CardHeader>
          <CardContent className='pe-0'>
            {isLoading ? (
              <div className='flex h-[300px] items-center justify-center'>
                <p>جاري التحميل...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className='flex h-[300px] items-center justify-center'>
                <p>لا توجد بيانات متاحة</p>
              </div>
            ) : (
              <>
                <div className='hidden'>
                  <pre>
                    {JSON.stringify(
                      quizzes.map((q) => ({
                        id: q.id,
                        attempts: q.attempts_log,
                      })),
                      null,
                      2,
                    )}
                  </pre>
                </div>
                <ChartContainer
                  config={getChartConfig(quizzes)}
                  className='w-full'
                >
                  <LineChart data={processChartData(quizzes)}>
                    <Legend
                      verticalAlign='bottom'
                      align='center'
                      iconType='line'
                      wrapperStyle={{ bottom: -10 }}
                    />
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      interval={5}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={20}
                      tickCount={5}
                    />
                    {quizzes.map((quiz) => (
                      <Line
                        key={quiz.id}
                        dataKey={quiz.id}
                        type='monotone'
                        stroke={getChartConfig(quizzes)[quiz.id].color}
                        strokeWidth={2}
                        dot={false}
                        name={quiz.id.split('-')[0]}
                      />
                    ))}
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={false}
                    />
                  </LineChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
        </Card>
        {/*  */}
        {/* <Card className='h-full w-full max-w-4xl rounded-xl bg-card backdrop-blur-sm md:aspect-square'>
          <CardHeader>
            <CardTitle className='text-2xl'>لمحة عامة</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 text-right'>
            <div>
              <p className='text-xs text-muted-foreground'>إجمالي المحاولات</p>
              <p className='text-3xl font-bold'>{metrics.totalAttempts}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>نسبة النجاح</p>
              <p className='text-3xl font-bold text-green-500'>
                {metrics.successRate}%
              </p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>نسبة الفشل</p>
              <p className='text-3xl font-bold text-red-500'>
                {metrics.failureRate}%
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Group Info Section */}

      <Card className='w-full max-w-4xl rounded-xl bg-card backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>الاختبارات</CardTitle>
          <CardDescription>نظرة عامة على جميع الاختبارات</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-4 overflow-hidden md:grid md:grid-cols-2'>
          {quizzes.length > 0 ? (
            quizzes.map(
              ({
                id,
                original_url,
                url,
                attempts_log,
                lastAttemptAt,
                status,
              }) => {
                const totalAttempts = attempts_log?.length
                  ? attempts_log[attempts_log.length - 1].attempts
                  : 0;

                const successAttempts = attempts_log?.length
                  ? attempts_log[attempts_log.length - 1].success_attempts
                  : 0;

                const lastActivity = lastAttemptAt
                  ? new Date(lastAttemptAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'لا يوجد';

                const isExpanded = expandedQuiz === id;

                return (
                  <Card
                    key={id}
                    className={`flex w-full max-w-64 flex-col gap-2 rounded-xl bg-card p-3 backdrop-blur-sm transition-all duration-300 ${
                      isExpanded ? 'h-auto w-96' : 'h-24' // Expand on click
                    }`}
                  >
                    {/* Collapsed View */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                          <ClipboardList className='h-4 w-4 text-primary' />
                        </div>
                        <CardTitle className='text-sm font-bold'>
                          {id.split('-')[0]}
                        </CardTitle>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-sm font-medium'>
                          <ChartBar className='h-4 w-4 text-primary' />
                          <span>{totalAttempts}</span>
                        </div>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          {status === 'inactive' ? (
                            <CircleXIcon className='h-3 w-3 text-red-500' />
                          ) : (
                            <CheckCircle className='h-3 w-3 text-green-500' />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <div
                      onClick={() => handleExpandClick(id)}
                      className='mt-2 cursor-pointer text-sm text-primary hover:text-primary/80'
                    >
                      {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                    </div>

                    {/* Expanded View with more details */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-screen' : 'max-h-0'
                      }`}
                      style={{
                        padding: isExpanded ? '10px' : '0',
                      }}
                    >
                      {/* Full Details */}
                      <div className='mt-2 flex flex-col gap-2'>
                        <div className='flex items-center gap-2 text-left text-xs text-muted-foreground'>
                          <span>الرابط:</span>
                          <a
                            href={original_url}
                            target='_blank'
                            rel='noreferrer'
                            className='text-primary hover:underline'
                          >
                            {original_url}
                          </a>
                        </div>

                        <div className='flex items-center gap-2 text-left text-xs text-muted-foreground'>
                          <span>الرابط:</span>
                          <a
                            href={url}
                            target='_blank'
                            rel='noreferrer'
                            className='text-primary hover:underline'
                          >
                            {url}
                          </a>
                        </div>

                        <div className='flex flex-col items-start gap-2 text-xs text-muted-foreground'>
                          <span>محاولات: {totalAttempts}</span>
                          <span>محاولات ناجحة: {successAttempts}</span>
                          <span>
                            محاولات فاشلة: {totalAttempts - successAttempts}
                          </span>
                        </div>

                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>تاريخ آخر تحديث: {lastActivity}</span>
                        </div>

                        <div className='flex w-full items-center gap-2 text-xs text-muted-foreground'>
                          <span>الحالة:</span>
                          {status === 'inactive' ? (
                            <span className='text-red-500'>غير نشط</span>
                          ) : (
                            <span className='text-green-500'>نشط</span>
                          )}

                          <Button
                            onClick={() =>
                              handleToggleQuizStatus(
                                id,
                                status == 'active' ? 'deactivate' : 'activate',
                              )
                            }
                            variant='ghost'
                          >
                            {status === 'inactive' ? (
                              <span className='text-green-500'>
                                تفعيل الاختبار
                              </span>
                            ) : (
                              <span className='text-red-500'>
                                تعطيل الاختبار
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteQuiz(id)}
                        variant='ghost'
                        className='right-2 top-2 p-1 text-red-500 hover:text-red-600'
                        disabled={loadingQuizId === id}
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </Card>
                );
              },
            )
          ) : (
            <p className='text-center text-lg text-muted-foreground'>
              لا يوجد اختبارات بعد.
            </p>
          )}
        </CardContent>
      </Card>

      {/* <Card className='w-full max-w-4xl rounded-xl bg-card backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>أكثر المستخدمين نشاطاً</CardTitle>
          <CardDescription>
            المستخدمون الأكثر تفاعلاً خلال الشهر الحالي
          </CardDescription>
        </CardHeader>
        <CardContent> */}
      {/* TODO: Fetch and map most active users here */}
      {/* <p className='text-center text-lg text-muted-foreground'>
            🚀 قيد التطوير
          </p>
        </CardContent>
      </Card> */}
    </main>
  );
}

export default Dashboard;
