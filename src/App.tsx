import { useRef, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';

import Header from '@/components/ui/header';
import { ParallaxLogo } from './components/ui/ParallaxLogo';
import Modal from './components/modal';
import Hero from './components/hero';
// add reanimted? add some animations to the page

function App() {
  const tokenRef = useRef('');

  const { getToken } = useAuth();
  const { user } = useUser();

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

  return (
    <div className='min-h-screen flex flex-col items-center bg-background gap-10'>
      <Header />

      <Hero />
      <Modal tokenRef={tokenRef} />

      <ParallaxLogo />
      <Toaster />
    </div>
  );
}

export default App;
