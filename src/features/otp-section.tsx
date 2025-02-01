import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OTPMethod } from '@/lib/types';

interface OTPSectionProps {
  otpMethod: OTPMethod;
  setOtpMethod: (method: OTPMethod) => void;
  otpContact: string;
  setOtpContact: (contact: string) => void;
}

export function OTPSection({
  otpMethod,
  setOtpMethod,
  otpContact,
  setOtpContact,
}: OTPSectionProps) {
  return (
    <div className='space-y-4 rounded-lg border p-3'>
      <Label className='text-lg'>طريقة استلام رمز التحقق</Label>
      <div className='grid grid-cols-2 gap-3'>
        <MethodOption
          icon={<Mail className='h-5 w-5' />}
          label='البريد الإلكتروني'
          isSelected={otpMethod === 'email'}
          onClick={() => setOtpMethod('email')}
        />
        <MethodOption
          icon={<Phone className='h-5 w-5' />}
          label='رقم الهاتف'
          isSelected={otpMethod === 'phone'}
          onClick={() => setOtpMethod('phone')}
        />
      </div>

      <Input
        placeholder={
          otpMethod === 'email' ? 'ادخل البريد الإلكتروني' : 'ادخل رقم الهاتف'
        }
        value={otpContact}
        onChange={(e) => setOtpContact(e.target.value)}
        type={otpMethod === 'email' ? 'email' : 'tel'}
        className='mt-2'
      />
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
