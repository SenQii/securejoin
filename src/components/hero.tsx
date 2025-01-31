import { Card, CardContent, CardHeader } from './ui/card'

function Hero() {
  return (
    <div className='z-40 px-5 flex flex-col items-center justify-center gap-5 w-full'>
      {/* hero 1 */}
      <div className='w-full flex flex-row items-center justify-evenly gap-4 max-w-4xl'>
        <Card className='bg-card aspect-square w-full max-w-64 rounded-xl backdrop-blur-sm'>
          <CardHeader className='items-center justify-center '>
            <div className='relative w-full'>
              <h1 className='text-md md:text-lg font-bold text-center '>
                SecureJoin
              </h1>
              <img
                src='/images/wave_blue.svg'
                alt='blue wave'
                className='absolute -bottom-2 left-0 w-full scale-125 md:scale-100 -z-30'
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-gray-500'>هل لديك سيكيورلينك؟ انضم الآن!</p>
          </CardContent>
        </Card>
        <Card className='rounded-xl aspect-square w-full max-w-64 items-center justify-center flex backdrop-blur-sm bg-white bg-opacity-20'>
          <CardContent className=' p-0'>
            <img
              src='/images/security.svg'
              alt='signin'
              className='w-full h-full'
            />
          </CardContent>
        </Card>
      </div>

      <div className='hidden w-full flex-row items-center justify-evenly gap-4 max-w-4xl'>
        <Card className='rounded-xl aspect-square w-full max-w-64 items-center justify-center flex backdrop-blur-sm bg-white bg-opacity-20'>
          <CardContent className='p-0'>
            <img
              src='src/assets/security.svg'
              alt='signin'
              className='w-full h-full'
            />
          </CardContent>
        </Card>
        <Card className='bg-card aspect-square w-full max-w-64 rounded-xl backdrop-blur-sm'>
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
  )
}

export default Hero
