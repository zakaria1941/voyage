import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm text-ink-900',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500/40',
          error ? 'border-danger-400 focus:border-danger-500' : 'border-ink-200 focus:border-brand-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
});
Select.displayName = 'Select';
