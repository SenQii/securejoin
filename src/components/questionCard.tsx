import { QuizQuestion } from '@/lib/types';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';

interface QuestionCardProps {
  index: number;
  questions: QuizQuestion[];
  question: QuizQuestion;
  setQuestions: (questions: QuizQuestion[]) => void;
  handleQuestionChange: (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => void;
}

export default function QuestionCard({
  index,
  questions,
  question,
  setQuestions,
  handleQuestionChange,
}: QuestionCardProps) {
  return (
    <div key={index} className='relative rounded-lg border bg-card/50 p-4'>
      <div className='absolute left-2 top-2'>
        {questions.length > 1 && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => {
              const newQuestions = questions.filter((_, i) => i !== index);
              setQuestions(newQuestions);
            }}
            className='h-8 w-8 p-0'
          >
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        )}
      </div>

      <div className='mt-6 space-y-4'>
        <div className='mb-4 flex items-center gap-4'>
          <Label>نوع السؤال:</Label>
          <div className='flex gap-4'>
            <div
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                !question.questionType || question.questionType === 'text'
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/50',
              )}
              onClick={() => {
                const newQuestions = [...questions];
                newQuestions[index] = {
                  ...newQuestions[index],
                  questionType: 'text',
                  options: undefined,
                };
                setQuestions(newQuestions);
              }}
            >
              <span>نص</span>
            </div>
            <div
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                question.questionType === 'mcq'
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/50',
              )}
              onClick={() => {
                const newQuestions = [...questions];
                newQuestions[index] = {
                  ...newQuestions[index],
                  questionType: 'mcq',
                  options: [
                    { label: '', isCorrect: true },
                    { label: '', isCorrect: false },
                  ],
                };
                setQuestions(newQuestions);
              }}
            >
              <span>اختيار متعدد</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor={`question-${index}`}>السؤال {index + 1}</Label>
            <Input
              id={`question-${index}`}
              placeholder='ادخل السؤال'
              value={question.question}
              onChange={(e) =>
                handleQuestionChange(index, 'question', e.target.value)
              }
              required
              minLength={4}
              maxLength={140}
            />
          </div>

          {!question.questionType || question.questionType === 'text' ? (
            <div className='space-y-2'>
              <Label htmlFor={`answer-${index}`}>الإجابة</Label>
              <Input
                id={`answer-${index}`}
                placeholder='ادخل الإجابة'
                value={question.answer}
                onChange={(e) =>
                  handleQuestionChange(index, 'answer', e.target.value)
                }
                required
              />
            </div>
          ) : (
            <div className='space-y-2'>
              <Label>الخيارات</Label>
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className='mb-2 flex items-center gap-2'>
                  <Input
                    placeholder={`الخيار ${optionIndex + 1}`}
                    value={option.label}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].options![optionIndex].label =
                        e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className='flex-1'
                  />
                  <div
                    className={cn(
                      'cursor-pointer rounded-lg border px-2 py-1 text-sm transition-colors',
                      option.isCorrect
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : 'hover:border-primary/50',
                    )}
                    onClick={() => {
                      const newQuestions = [...questions];
                      // Set all options to incorrect first
                      newQuestions[index].options!.forEach(
                        (opt) => (opt.isCorrect = false),
                      );
                      // Set selected option to correct
                      newQuestions[index].options![optionIndex].isCorrect =
                        true;
                      setQuestions(newQuestions);
                    }}
                  >
                    {option.isCorrect ? 'إجابة صحيحة' : 'حدد كإجابة صحيحة'}
                  </div>
                </div>
              ))}
              {question.options && question.options.length < 4 && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newQuestions = [...questions];
                    newQuestions[index].options!.push({
                      label: '',
                      isCorrect: false,
                    });
                    setQuestions(newQuestions);
                  }}
                  className='mt-2'
                >
                  إضافة خيار
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
