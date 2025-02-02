import { Label } from '@/components/ui/label';
import { AlertCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationMethod } from '@/lib/types';

interface VerificationMethodsProps {
  verificationMethod: VerificationMethod;
  setVerificationMethod: (method: VerificationMethod) => void;
  vertifyMethodRef: React.MutableRefObject<VerificationMethod>;
}

export function VerificationMethods({
  verificationMethod,
  setVerificationMethod,
  vertifyMethodRef,
}: VerificationMethodsProps) {
  return (
    <div className='space-y-4'>
      <Label className='text-lg'>طريقة التحقق</Label>
      <div className='grid grid-cols-3 gap-3 md:grid-cols-3'>
        <MethodCard
          icon={<AlertCircle className='h-6 w-6 text-primary' />}
          label='أسئلة التحقق'
          isSelected={verificationMethod === 'questions'}
          onClick={() => {
            setVerificationMethod('questions');
            vertifyMethodRef.current = 'questions';
          }}
        />
        <MethodCard
          icon={<MessageSquare className='h-6 w-6 text-primary' />}
          label='رمز التحقق'
          isSelected={verificationMethod === 'otp'}
          onClick={() => {
            setVerificationMethod('otp');
            vertifyMethodRef.current = 'otp';
          }}
        />
        <MethodCard
          icon={<ShieldCheck className='h-6 w-6 text-primary' />}
          label='كلاهما'
          isSelected={verificationMethod === 'both'}
          onClick={() => {
            setVerificationMethod('both');
            vertifyMethodRef.current = 'both';
          }}
          // className='col-span-2 md:col-span-1'
        />
      </div>
    </div>
  );
}

interface MethodCardProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

function MethodCard({
  icon,
  label,
  isSelected,
  onClick,
  className,
}: MethodCardProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
        isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50',
        className,
      )}
      onClick={onClick}
    >
      <div className='rounded-full bg-primary/20 p-2'>{icon}</div>
      <span className='text-center text-sm'>{label}</span>
    </div>
  );
}
