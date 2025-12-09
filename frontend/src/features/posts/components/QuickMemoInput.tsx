import type { FormEvent } from 'react';
import { useState } from 'react';
import clsx from 'clsx';

interface QuickMemoInputProps {
  onCreate: (body: string) => void;
  isSubmitting: boolean;
}

export function QuickMemoInput({
  onCreate,
  isSubmitting,
}: QuickMemoInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2"
    >
      <input
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        placeholder="빠르게 메모를 남겨보세요..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        disabled={isSubmitting || !value.trim()}
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white',
          isSubmitting || !value.trim()
            ? 'bg-slate-300'
            : 'bg-blue-500 hover:bg-blue-600',
        )}
      >
        +
      </button>
    </form>
  );
}
