import { useState } from 'react';
import { URL } from '@/lib/constant';
import toast from 'react-hot-toast';
import { validateUrl } from '@/lib/utils';
import { QuizQuestion, VerificationMethod } from '@/lib/types';

import React from 'react';

export default function useSecureLink(
  tokenRef: React.MutableRefObject<string>,
) {
  const [secureLink, setSecureLink] = useState('');

  const createSecureLink = async (
    VerificationMethod: VerificationMethod,
    questions: QuizQuestion[],
    groupUrl: string,
    otpMethod?: 'mail' | 'sms',
  ) => {
    // validation
    if (!validateUrl(groupUrl)) {
      toast.error(
        'لم ندعم هذا الرابط بعد، يرجى استخدام رابط منصة اجتماعية أخرى',
      );
      return false;
    }
    try {
      // return;
      const response = await fetch(`${URL}/create_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': tokenRef.current,
        },
        body: JSON.stringify({
          quiz_list: questions,
          original_url: groupUrl,
          vertify_methods: VerificationMethod,
          otp_method: VerificationMethod === 'questions' ? null : otpMethod,
        }),
      });
      if (!response.ok)
        throw new Error(`Network response was not ok ${response.status}`);

      const data = await response.json();
      if (data.status === 'success') {
        setSecureLink(data.link || '');
        toast.success('تم إنشاء الرابط بنجاح');
        return data.link;
      }

      //   otherwise
      throw new Error('Failed to create link');
    } catch (error) {
      console.log('could not post to server', error);
      toast.error('حدث خطأ أثناء إنشاء الرابط');
      setSecureLink('');
      return false;
    }
  };

  return {
    secureLink,
    createSecureLink,
  };
}
