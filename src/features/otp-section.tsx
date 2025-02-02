import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OTPMethod } from '@/lib/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface OTPSectionProps {
  otpMethod: OTPMethod;
  setOtpMethod: (method: OTPMethod) => void;
  otpContact?: string;
  setOtpContact?: (contact: string) => void;
  mode: 'create' | 'join';
}

export function OTPSection({
  otpMethod,
  setOtpMethod,
  otpContact,
  setOtpContact,
  mode,
}: OTPSectionProps) {
  console.log('ff', otpMethod);

  if (mode === 'create')
    return (
      <div className='space-y-4 rounded-lg border p-3'>
        <Label className='text-lg'>طريقة استلام رمز التحقق</Label>
        <div className='grid grid-cols-2 gap-3'>
          <MethodOption
            icon={<Mail className='h-5 w-5' />}
            label='البريد الإلكتروني'
            isSelected={otpMethod === 'mail'}
            onClick={() => setOtpMethod('mail')}
          />
          <MethodOption
            icon={<Phone className='h-5 w-5' />}
            label='رقم الهاتف'
            isSelected={otpMethod === 'sms'}
            onClick={() => setOtpMethod('sms')}
          />
        </div>
      </div>
    );

  return (
    <div className='space-y-4 rounded-lg border p-3'>
      <div className='flex items-center gap-2'>
        {otpMethod === 'mail' ? (
          <Mail className='h-5 w-5' />
        ) : (
          <Phone className='h-5 w-5' />
        )}
        <Label className='text-lg'>
          التحقق عبر {otpMethod === 'mail' ? 'البريد الإلكتروني' : 'رقم الهاتف'}
        </Label>
      </div>

      <div className='space-y-4'>
        <Input
          placeholder={
            otpMethod === 'mail' ? 'ادخل البريد الإلكتروني' : 'ادخل رقم الهاتف'
          }
          value={otpContact}
          onChange={(e) => setOtpContact?.(e.target.value)}
          type={otpMethod === 'mail' ? 'email' : 'tel'}
          className='mt-2'
        />

        <Button
          type='button'
          variant='outline'
          className='w-full md:w-auto'
          onClick={() => {
            // TODO: Implement OTP sending
            toast.success('تم إرسال رمز التحقق');
          }}
        >
          إرسال رمز التحقق
        </Button>

        <div className='space-y-2'>
          <Label>رمز التحقق</Label>
          <Input
            placeholder='ادخل رمز التحقق'
            type='text'
            maxLength={6}
            className='w-full md:w-1/3'
          />
        </div>
      </div>
    </div>
  );
}

interface MethodOptionProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function MethodOption({ icon, label, isSelected, onClick }: MethodOptionProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
        isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50',
      )}
      onClick={onClick}
    >
      {icon}
      <span className='text-sm'>{label}</span>
    </div>
  );
}
