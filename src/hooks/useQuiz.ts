import React, { useState } from 'react';
import { URL } from '@/lib/constant';
import toast from 'react-hot-toast';
import { QuizQuestion } from '@/lib/types';

export function useQuiz(tokenRef: React.MutableRefObject<string>) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [joinLink, setJoinLink] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'mail' | undefined>(
    undefined,
  );
  const [verificationMethods, setVerificationMethods] = useState<string[]>([]);

  // onSubmit
  const checkAnswers = async (secureURL: string) => {
    try {
      // api
      const response = await fetch(`${URL}/check_answer`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'access-token': tokenRef.current,
        },
        body: JSON.stringify({
          answers: quizAnswers,
          link: secureURL,
        }),
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.status}`);
      }
      const data = await response.json();

      console.log('response:', data);

      if (data.status === 'failed') {
        toast.error('الإجابة خاطئة، حاول مرة أخرى');
        return false;
      }

      toast.success('اجابتك صحيحة، اضغط الرابط أسفل الصفحة للانضمام');
      setJoinLink(data.direct_link);
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء التحقق من الإجابات');
      return false;
    }
  };

  // fetch quiz from securejoin
  const getQuiz = async (link: string) => {
    try {
      // api
      const response = await fetch(`${URL}/get_quiz`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'access-token': tokenRef.current,
        },
        body: JSON.stringify({
          link: link,
        }),
      });
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('لا يوجد رابط مطابق');
          return false;
        }
        throw new Error(`Network response was not ok ${response.status}`);
      }

      //   handle data
      const data = await response.json();
      console.log('data:', data);

      // Set verification methods from server response
      setVerificationMethods(data.vertify_methods || []);

      // CASE: OTP only
      if (data.message === 'OTP' || data.message === 'BOTH') {
        setOtpMethod(data.otp_method);
      }

      // CASE: both
      if (data.message === 'BOTH' || data.message === 'Questions') {
        setQuiz(data.quiz);
      }

      return true;
    } catch (error) {
      console.log('could not post to server', error);
      toast.error('حدث خطأ أثناء التحقق من الرابط');
      return false;
    }
  };

  return {
    quiz,
    quizAnswers,
    joinLink,
    setQuizAnswers,
    checkAnswers,
    getQuiz,
    otpMethod,
    setOtpMethod,
    verificationMethods,
  };
}
