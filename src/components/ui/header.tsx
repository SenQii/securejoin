import { useClerk } from '@clerk/clerk-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

function Header() {
  const { openSignIn } = useClerk();
  return (
    // background: rgba(67, 120, 255, 0.01);
    // box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.19);
    // backdrop-filter: blur(5px);
    <header className='backdrop-blur-sm flex flex-row justify-between items-center p-5 sticky top-0 z-50 shadow-md'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-end gap-0.5'>
          <img
            src='/logo.svg'
            alt='SecureJoin'
            className='w-10 h-10 sm:w-12 sm:h-12'
          />
          <h1 className='text-3xl font-bold text-white flex items-center'>
            SecureJoin
          </h1>
        </div>
        <p className='mt-2 text-lg text-white'>
          أمّن مجموعتك عبر بوابة الانضمام الآمنة
        </p>
      </div>

      <SignedOut>
        <div
          className='flex flex-col items-center cursor-pointer gap-1 '
          onClick={() => openSignIn()}
        >
          <img src='/src/assets/signin.svg' width={32} height={32} />
          <span className='text-white text-sm'>سجل الدخول</span>
        </div>
      </SignedOut>
      <SignedIn>
        <div className='flex flex-col items-center cursor-pointer gap-1'>
          <UserButton />
        </div>
      </SignedIn>
    </header>
  );
}

export default Header;
