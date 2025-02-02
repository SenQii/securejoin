import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateUrl } from '@/lib/utils';

interface GroupUrlInputProps {
  groupUrl: string;
  setGroupUrl: (url: string) => void;
  groupUrlRef: React.MutableRefObject<string>;
}

export function GroupUrlInput({
  groupUrl,
  setGroupUrl,
  groupUrlRef,
}: GroupUrlInputProps) {
  return (
    <div>
      <Label htmlFor='groupUrl' className='text-lg'>
        رابط المجموعة
      </Label>
      <Input
        id='groupUrl'
        placeholder='https://chat.whatsapp.com/xxxxx'
        value={groupUrl}
        onChange={(e) => {
          const input = e.target.value;
          setGroupUrl(input);
          groupUrlRef.current = input;
        }}
        required
        className='mt-1.5 w-full border-border bg-input focus:border-primary md:w-1/2'
      />
      {groupUrlRef.current && (
        <div className='mt-2 text-sm text-gray-600'>
          {validateUrl(groupUrlRef.current)
            ? ''
            : 'رابط غير مدعوم، يرجى استخدام رابط منصة اجتماعية أخرى'}
        </div>
      )}
    </div>
  );
}
