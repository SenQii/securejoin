import { Card, CardContent, CardHeader } from './ui/card';

function Hero() {
  return (
    <div className='z-40 flex w-full flex-col items-center justify-center gap-5 px-5'>
      {/* hero 1 */}
      <div className='flex w-full max-w-4xl flex-row items-center justify-evenly gap-4'>
        <Card className='aspect-square w-full max-w-64 rounded-xl bg-card backdrop-blur-sm'>
          <CardHeader className='items-center justify-center'>
            <div className='relative w-full'>
              <h1 className='text-md text-center font-bold md:text-lg'>
                SecureJoin
              </h1>
              <img
                src='/images/wave_blue.svg'
                alt='blue wave'
                className='absolute -bottom-2 left-0 -z-30 w-full scale-125 md:scale-100'
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-gray-500'>هل لديك سيكيورلينك؟ انضم الآن!</p>
          </CardContent>
        </Card>
        <Card className='flex aspect-square w-full max-w-64 items-center justify-center rounded-xl bg-white bg-opacity-20 backdrop-blur-sm'>
          <CardContent className='h-full w-full p-0'>
            <img
              src='/images/security.svg'
              alt='signin'
              className='h-full w-full'
            />
          </CardContent>
        </Card>
      </div>

      <div className='hidden w-full max-w-4xl flex-row items-center justify-evenly gap-4'>
        <Card className='flex aspect-square w-full max-w-64 items-center justify-center rounded-xl bg-white bg-opacity-20 backdrop-blur-sm'>
          <CardContent className='p-0'>
            <img
              src='src/assets/security.svg'
              alt='signin'
              className='h-full w-full'
            />
          </CardContent>
        </Card>
        <Card className='aspect-square w-full max-w-64 rounded-xl bg-card backdrop-blur-sm'>
          <CardHeader className='relative items-center justify-center'>
            {/* <h1 className='text-xl font-bold text-center'>
              lemonade stand app?
            </h1> */}
          </CardHeader>
          <CardContent>
            {/* <p className='text-gray-500'>
              This is a starter template for Next.js with Tailwind CSS and
              TypeScript.
            </p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Hero;
