import { useState } from 'react';
import toast from 'react-hot-toast';
import { URL } from '@/lib/constant';
import { AttemptManager } from '@/lib/attempt-manager';
import { useID } from '@/hooks/useID';

export function useOTP(method: 'sms' | 'mail') {
  const [otpContact, setOtpContact] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isContactInputVisible, setIsContactInputVisible] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const user_id = useID();

  const handleSendOTP = async () => {
    try {
      const isBanned = AttemptManager.isBanned(user_id);
      if (isBanned) return;

      const contact = method === 'sms' ? `966${otpContact}` : otpContact;
      const response = await fetch(`${URL}/send_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact, method }),
      });
      if (!response.ok) {
        if (response.status === 403) {
          AttemptManager.recordAttempt(user_id);
          toast.error('لا يمكن استخدام هذا الرقم');
        }
        if (response.status === 429) {
          AttemptManager.recordAttempt(user_id);
          toast.error('بلغت الحد الأقصى لطلبات التحقق');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'approved') {
        toast.success('تم إرسال رمز التحقق بنجاح');
        setShowOtpInput(true);
        setIsContactInputVisible(false);
      } else {
        AttemptManager.recordAttempt(user_id);
        toast.error('فشل في إرسال رمز التحقق');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('حدث خطأ أثناء إرسال رمز التحقق');
    }
  };

  const verifyOTP = async (
    quiz_id: string,
  ): Promise<{
    success: boolean;
    directLink?: string;
    remainingAttempts?: number;
  }> => {
    try {
      const isBanned = AttemptManager.isBanned(user_id);
      if (isBanned) return { success: false };

      const response = await fetch(`${URL}/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: otpCode,
          contact: otpContact,
          quiz_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'approved') {
        toast.success('تم التحقق بنجاح');
        setIsVerified(true);
        return { success: true, directLink: data.direct_link };
      }

      AttemptManager.recordAttempt(user_id);
      const remainingAttempts = AttemptManager.getRemainingAttempts(user_id);
      toast.error('رمز التحقق غير صحيح');
      return { success: false, remainingAttempts };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('حدث خطأ أثناء التحقق من الرمز');
      return { success: false };
    }
  };

  return {
    otpContact,
    setOtpContact,
    showOtpInput,
    isContactInputVisible,
    otpCode,
    setOtpCode,
    isVerified,
    handleSendOTP,
    verifyOTP,
  };
}
