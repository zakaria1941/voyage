import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, error, ...props }, ref) => {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
      <input
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500/40',
          error ? 'border-danger-400 focus:border-danger-500' : 'border-ink-200 focus:border-brand-500',
          icon && 'pl-10',
          className,
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = 'Input';
