import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-ink-100 bg-white shadow-soft', className)}
      {...props}
    />
  );
}

export function CardHoverable({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lifted',
        className,
      )}
      {...props}
    />
  );
}
