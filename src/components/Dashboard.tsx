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
import { ChartBar, CheckCircle, ClipboardList } from 'lucide-react';

const chartConfig = {
  Group_A: { label: 'Group A', color: '#204fb4' },
  Group_B: { label: 'Group B', color: '#60a5fa' },
} satisfies ChartConfig;

const Chartdata = [
  { day: '01', month: '01', Group_A: 12, Group_B: 8 },
  { day: '04', month: '01', Group_A: 21, Group_B: 20 },
  { day: '08', month: '01', Group_A: 23, Group_B: 15 },
  { day: '16', month: '01', Group_A: 13, Group_B: 25 },
  { day: '30', month: '01', Group_A: 17, Group_B: 23 },
  { day: '32', month: '01', Group_A: 19, Group_B: 16 },
];

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
  status: 'active' | 'active';
};

// const get_data = () => {
//   // fetch data from the server
//   // temp::
//   const dummyData: QuizType[] = [
//     {
//       id: 'dgfhidwskcndbh',
//       original_Link: 'https://www.google.com',
//       secure_Link: 'https://securejoin.com/11',
//       verification_methods: ['QUESTIONS', 'OTP'],
//       otp_method: 'sms',
//       attempts_log: [
//         { date: '2021-10-01', attempts: 5, success_attempts: 2 },
//         { date: '2021-10-02', attempts: 9, success_attempts: 4 },
//         { date: '2021-10-03', attempts: 12, success_attempts: 3 },
//         { date: '2021-10-04', attempts: 22, success_attempts: 6 },
//         { date: '2021-10-05', attempts: 27, success_attempts: 5 },
//       ],
//       isActive: true,
//     },
//     {
//       id: 'fehiwdksnc',
//       original_Link: 'https://www.facebook.com',
//       secure_Link: 'https://securejoin.com/12',
//       verification_methods: ['QUESTIONS'],
//       attempts_log: [
//         { date: '2021-10-01', attempts: 5, success_attempts: 4 },
//         { date: '2021-10-01', attempts: 12, success_attempts: 5 },
//         { date: '2021-10-02', attempts: 14, success_attempts: 3 },
//         { date: '2021-10-04', attempts: 19, success_attempts: 4 },
//         { date: '2021-10-15', attempts: 27, success_attempts: 6 },
//       ],
//       isActive: true,
//     },
//   ];
//   // format data for the chart
//   // 1: get the dates & devide them into weeks
//   // 2: get the attempts for each week
//   // 3: return full config for the chart
// };

function Dashboard() {
  const { getToken } = useAuth();
  const [token, setToken] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  const handleExpandClick = (id: string) => {
    setExpandedQuiz((prev) => (prev === id ? null : id)); // Toggle expansion
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
      try {
        const res = await fetch(`${URL}/get_user_quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log('fetching data: ', data.quiz);
        if (res.ok) {
          console.log('User quizzes:', data.quiz);
          setQuizzes(data.quiz);
        } else {
          console.error('Error fetching quizzes:', data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchData();
  }, [token]);

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
            <CardDescription>عمليات الدخول خلال الشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent className='pe-0'>
            <ChartContainer config={chartConfig} className='w-full'>
              <LineChart data={Chartdata}>
                <Legend
                  verticalAlign='bottom'
                  align='center'
                  iconType='line'
                  wrapperStyle={{ bottom: -10 }}
                />
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='day'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  // skip count
                  ticks={Chartdata.map((item) =>
                    parseInt(item.day) % 2 ? item.day : '',
                  )}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={20}
                  tickCount={5}
                />
                <Line
                  dataKey='Group_A'
                  type='monotone'
                  stroke={chartConfig.Group_A.color}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey='Group_B'
                  type='monotone'
                  stroke={chartConfig.Group_B.color}
                  strokeWidth={2}
                  dot={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
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
        <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {quizzes.length > 0 ? (
            quizzes.map(({ id, original_url, attempts_log, lastAttemptAt }) => {
              const totalAttempts = attempts_log?.length
                ? attempts_log[attempts_log.length - 1].attempts
                : 0;

              const successAttempts = attempts_log?.length
                ? attempts_log[attempts_log.length - 1].success_attempts
                : 0;

              const statusIcon = '🟢';

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
                      <ClipboardList className='text-primary' />
                      <CardTitle className='text-sm'>
                        {id.split('-')[0]}
                      </CardTitle>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <ChartBar />
                      <span>{totalAttempts}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <CheckCircle />
                      <span>{statusIcon}</span>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <div
                    onClick={() => handleExpandClick(id)}
                    className='mt-2 cursor-pointer text-sm text-primary'
                  >
                    {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                  </div>

                  {/* Expanded View with more details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-screen' : 'max-h-0'
                    }`}
                    style={{
                      padding: isExpanded ? '10px' : '0', // Add padding when expanded
                    }}
                  >
                    {/* Full Details */}
                    <div className='mt-2 flex flex-col gap-2'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>الرابط:</span>
                        <a
                          href={original_url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-primary'
                        >
                          {original_url}
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
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className='text-center text-lg text-muted-foreground'>
              لا يوجد اختبارات بعد.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Most Active Users Section (Placeholder) */}
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
