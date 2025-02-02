import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { QuizQuestion } from '@/lib/types';
import QuestionCard from '@/components/questionCard';

interface QuestionsSectionProps {
  questions: QuizQuestion[];
  setQuestions: (questions: QuizQuestion[]) => void;
  handleAddQuestion: () => void;
  handleQuestionChange: (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => void;
}

export function QuestionsSection({
  questions,
  setQuestions,
  handleAddQuestion,
  handleQuestionChange,
}: QuestionsSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-lg'>الأسئلة</Label>
        <Button
          type='button'
          variant='outline'
          onClick={handleAddQuestion}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          أضف سؤال
        </Button>
      </div>

      {questions.map((question, index) => (
        <QuestionCard
          index={index}
          question={question}
          questions={questions}
          setQuestions={setQuestions}
          handleQuestionChange={handleQuestionChange}
        />
      ))}
    </div>
  );
}
