import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useOTP } from '@/hooks/useOTP';
import { OTPMethod } from '@/lib/types';

interface OTPSectionProps {
  mode: 'create' | 'join';
  onVerificationSuccess?: (directLink?: string) => void;
  otpMethod: OTPMethod;
  setOtpMethod?: (method: OTPMethod) => void;
}

export function OTPSection({
  mode,
  onVerificationSuccess,
  otpMethod,
  setOtpMethod,
}: OTPSectionProps) {
  const {
    otpContact,
    setOtpContact,
    showOtpInput,
    isContactInputVisible,
    otpCode,
    setOtpCode,
    isVerified,
    handleSendOTP,
    verifyOTP,
  } = useOTP(otpMethod as 'sms' | 'mail');

  const handleVerifyClick = async () => {
    const result = await verifyOTP();
    if (result.success) {
      onVerificationSuccess?.(result.directLink);
    }
  };

  if (isVerified) {
    return (
      <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border border-green-200 bg-green-50 p-6'>
        <CheckCircle2 className='h-12 w-12 text-green-500' />
        <p className='text-center text-lg font-medium text-green-700'>
          تم التحقق من رمز التحقق بنجاح
        </p>
      </div>
    );
  }

  if (mode === 'create' && setOtpMethod) {
    return <MethodSelector otpMethod={otpMethod} setOtpMethod={setOtpMethod} />;
  }

  return (
    <div className='space-y-4 rounded-lg border p-3'>
      <OTPHeader otpMethod={otpMethod} />
      <OTPInputs
        otpMethod={otpMethod}
        otpContact={otpContact}
        setOtpContact={setOtpContact}
        showOtpInput={showOtpInput}
        isContactInputVisible={isContactInputVisible}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onSendOTP={handleSendOTP}
        onVerifyOTP={handleVerifyClick}
      />
    </div>
  );
}

function MethodSelector({
  otpMethod,
  setOtpMethod,
}: {
  otpMethod: OTPMethod;
  setOtpMethod: (method: OTPMethod) => void;
}) {
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
}

function OTPHeader({ otpMethod }: { otpMethod: OTPMethod }) {
  return (
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
  );
}

interface OTPInputsProps {
  otpMethod: OTPMethod;
  otpContact?: string;
  setOtpContact?: (contact: string) => void;
  showOtpInput: boolean;
  isContactInputVisible: boolean;
  otpCode: string;
  setOtpCode: (code: string) => void;
  onSendOTP: () => void;
  onVerifyOTP: () => void;
}

function OTPInputs({
  otpMethod,
  otpContact,
  setOtpContact,
  showOtpInput,
  isContactInputVisible,
  otpCode,
  setOtpCode,
  onSendOTP,
  onVerifyOTP,
}: OTPInputsProps) {
  return (
    <div className='space-y-4'>
      {isContactInputVisible && (
        <div className='space-y-2'>
          <Input
            placeholder={
              otpMethod === 'mail'
                ? 'ادخل البريد الإلكتروني'
                : 'ادخل رقم الهاتف'
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
            onClick={onSendOTP}
          >
            إرسال رمز التحقق
          </Button>
        </div>
      )}

      {showOtpInput && (
        <div className='space-y-2'>
          <Label>رمز التحقق</Label>
          <Input
            placeholder='ادخل رمز التحقق'
            type='text'
            inputMode='numeric'
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className='w-full md:w-1/3'
          />
          <Button
            type='button'
            variant='outline'
            className='w-full md:w-auto'
            onClick={onVerifyOTP}
          >
            تحقق من الرمز
          </Button>
        </div>
      )}
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
