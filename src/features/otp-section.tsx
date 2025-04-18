import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useOTP } from '@/hooks/useOTP';
import { OTPMethod } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

interface OTPSectionProps {
  mode: 'create' | 'join';
  onVerificationSuccess?: (directLink?: string) => void;
  otpMethod: OTPMethod;
  setJoinLink: (link: string) => void;
  setOtpMethod?: (method: OTPMethod) => void;
  quiz_id?: string;
}

export function OTPSection({
  mode,
  otpMethod,
  setJoinLink,
  setOtpMethod,
  quiz_id,
}: OTPSectionProps) {
  const {
    showOtpInput,
    isContactInputVisible,
    otpCode,
    setOtpCode,
    isVerified,
    handleSendOTP,
    verifyOTP,
    otpContact,
    setOtpContact,
  } = useOTP(otpMethod as 'sms' | 'mail');

  const handleVerifyClick = async () => {
    if (!quiz_id) return;
    const result = await verifyOTP(quiz_id);
    if (result.success && result.directLink) {
      setJoinLink(result.directLink);
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
    <div className='space-y-8 rounded-lg border p-3'>
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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev: number) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setResendDisabled(false);
            return 60; // Reset timer for next resend
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendDisabled]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpCode = otpCode.split('');
    newOtpCode[index] = value;
    setOtpCode(newOtpCode.join(''));

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and ensure it starts with 5
    if (!/^5?\d{0,8}$/.test(value)) return;
    setOtpContact?.(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    setOtpCode(pasteData);
    pasteData.split('').forEach((num, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = num;
      }
    });
    inputRefs.current[pasteData.length - 1]?.focus();
  };

  return (
    <div className='space-y-4'>
      {isContactInputVisible && (
        <div className='gap-4 space-y-4 md:flex md:items-center md:justify-start'>
          <Label className='font-medium'>
            {otpMethod === 'mail' ? 'البريد الإلكتروني' : 'رقم الهاتف'}
          </Label>
          <div className='flex flex-col items-center gap-4 md:flex-row'>
            {otpMethod === 'sms' ? (
              <div className='flex w-full items-center gap-2'>
                <Input
                  placeholder='5XXXXXXXX'
                  value={otpContact}
                  onChange={handlePhoneChange}
                  type='tel'
                  autoComplete='tel'
                  className='w-full'
                  dir='ltr'
                  pattern='5[0-9]{8}'
                  maxLength={9}
                />
                <div className='flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground'>
                  +966
                </div>
              </div>
            ) : (
              <Input
                placeholder='ادخل البريد الإلكتروني'
                value={otpContact}
                onChange={(e) => setOtpContact?.(e.target.value)}
                type='email'
                autoComplete='email'
                dir='ltr'
                pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
                className='w-full'
                lang='ar'
              />
            )}

            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => {
                onSendOTP();
                setResendDisabled(true);
                setTimer(60);
              }}
              disabled={
                otpMethod === 'sms' &&
                (!otpContact || !/^5\d{8}$/.test(otpContact))
              }
            >
              إرسال رمز التحقق
            </Button>
          </div>
        </div>
      )}

      {showOtpInput && (
        <div className='space-y-4'>
          <Label>رمز التحقق</Label>
          <div className='flex justify-center gap-2' dir='ltr'>
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type='text'
                inputMode='numeric'
                dir='ltr'
                pattern='[0-9]*'
                maxLength={1}
                placeholder={`${index + 1}`}
                className='border-grey-400 h-12 w-12 border-b-2 bg-transparent text-center text-lg focus:border-blue-500 focus:outline-none'
                onChange={(e) => handleChange(index, e.target.value)}
                onPaste={handlePaste}
              />
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            className='w-full md:w-auto'
            onClick={onVerifyOTP}
          >
            تحقق من الرمز
          </Button>
          <Button
            type='button'
            className='w-full md:w-auto'
            onClick={() => {
              onSendOTP();
              setResendDisabled(true);
              setTimer(60); // blocked for 60s
            }}
            disabled={resendDisabled}
          >
            {resendDisabled
              ? `إعادة الإرسال بعد ${timer} ثانية`
              : 'إعادة إرسال رمز التحقق'}
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
