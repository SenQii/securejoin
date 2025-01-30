import { useEffect, useState } from 'react';

export function ParallaxLogo() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setOffset(scrollPosition * -0.3); // Adjust 0.3 to control parallax speed
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <img
      src='/logo.svg'
      alt='Background Logo'
      className='absolute left-1/2 -translate-x-1/2 w-screen max-w-6xl h-auto bg-opacity-60'
      style={{
        transform: `translate(-50%, ${offset}px)`,
        top: '10%',
      }}
    />
  );
}
