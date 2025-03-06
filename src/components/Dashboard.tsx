import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

function Dashboard() {
  return (
    <main className='z-40 min-h-screen w-full px-5' dir='rtl'>
      <Card className='mx-auto w-full max-w-4xl overflow-hidden rounded-xl bg-card backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>لوحة التحكم</CardTitle>
          <CardDescription>استعرض مجموعاتك وأدرها من هنا</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <p>لوحة تحكم</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default Dashboard;
