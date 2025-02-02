import { VerificationMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertCircle, ShieldCheck, MessageSquare } from 'lucide-react';

interface VmethodProps {
  verificationMethod: VerificationMethod;
  setVerificationMethod: (method: VerificationMethod) => void;
}

interface Methods {
  [method: string]: { title: string; icon: JSX.Element };
}

const methods: Methods = {
  questions: {
    title: 'أسئلة التحقق',
    icon: <AlertCircle className='h-6 w-6 text-primary' />,
  },
  otp: {
    title: 'رمز التحقق',
    icon: <MessageSquare className='h-6 w-6 text-primary' />,
  },
  both: {
    title: 'كلاهما',
    icon: <ShieldCheck className='h-6 w-6 text-primary' />,
  },
};

export default function Vmethod({
  verificationMethod,
  setVerificationMethod,
}: VmethodProps) {
  return (
    <>
      {Object.keys(methods).map((method: string) => (
        <div
          key={method}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4',
            verificationMethod === method
              ? 'border-primary bg-primary/10'
              : 'hover:border-primary/50',
          )}
          onClick={() => setVerificationMethod(method as VerificationMethod)}
        >
          <div className='rounded-full bg-primary/20 p-2'>
            {methods[method].icon}
          </div>
          <span>{methods[method].title}</span>
        </div>
      ))}
    </>

    // <div
    //   className={cn(
    //     'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4',
    //     verificationMethod === 'questions'
    //       ? 'border-primary bg-primary/10'
    //       : 'hover:border-primary/50',
    //   )}
    //   onClick={() => setVerificationMethod('questions')}
    // >
    //   <div className='rounded-full bg-primary/20 p-2'>
    //     {methods[verificationMethod].icon}
    //   </div>
    //   <span>{methods[verificationMethod].title}</span>
    // </div>
  );
}
