import { useClerk } from '@clerk/clerk-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Tooltip } from './tooltip';

function Header() {
  const { openSignIn } = useClerk();

  return (
    <header className='sticky top-0 z-50 flex w-full flex-row items-center justify-between bg-[rgba(32,39,71,0.76)] px-5 py-2 shadow-md backdrop-blur-sm md:bg-transparent md:py-5'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-end gap-1.5'>
          <img
            src='/logo.svg'
            alt='SecureJoin'
            className='h-w-10 w-10 md:h-12 md:w-12'
          />
          <h1 className='text-xl font-bold text-white md:text-3xl'>
            SecureJoin
          </h1>
        </div>
        <p className='mt-2 text-xs text-gray-300 md:text-lg'>
          أمّن مجموعتك عبر بوابة الانضمام الآمنة
        </p>
      </div>

      <SignedOut>
        <div className='relative'>
          <div
            className='flex cursor-pointer flex-col items-center gap-1'
            onClick={() => openSignIn()}
          >
            <img src='/images/signin.svg' width={32} height={32} />
            <span className='text-center text-sm text-white'>سجل الدخول</span>
          </div>
          <Tooltip
            content='سجل دخولك لإنشاء روابط انضمام آمنة 🔐'
            position='bottom'
            arrowPosition='left'
            className='-bottom-24 left-0 text-center'
          />
        </div>
      </SignedOut>
      <SignedIn>
        <div className='flex cursor-pointer flex-col items-center gap-1'>
          <UserButton />
        </div>
      </SignedIn>
    </header>
  );
}

export default Header;
