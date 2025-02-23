import { useState } from 'react';
import toast from 'react-hot-toast';

export function useOTP(method: 'sms' | 'mail') {
  const [otpContact, setOtpContact] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isContactInputVisible, setIsContactInputVisible] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendOTP = async () => {
    try {
      const response = await fetch('http://localhost:3000/send_otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact: otpContact, method }),
      });
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('تم حظر الرقم عن استخدام الخدمة');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'approved') {
        toast.success('تم إرسال رمز التحقق بنجاح');
        setShowOtpInput(true);
        setIsContactInputVisible(false);
      } else {
        toast.error('فشل في إرسال رمز التحقق');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('حدث خطأ أثناء إرسال رمز التحقق');
    }
  };

  const verifyOTP = async (): Promise<{
    success: boolean;
    directLink?: string;
  }> => {
    try {
      const response = await fetch('http://localhost:3000/verify_otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: otpCode, contact: otpContact }),
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

      toast.error('رمز التحقق غير صحيح');
      return { success: false };
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
