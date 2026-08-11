import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      aria-invalid={Boolean(error)}
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500/40',
        error ? 'border-danger-400 focus:border-danger-500' : 'border-ink-200 focus:border-brand-500',
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
