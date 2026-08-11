import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2 shrink-0', className)} aria-label="Voyago home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-soft">
        <Compass className="size-5" strokeWidth={2.25} />
      </span>
      <span className={cn('font-display text-xl font-bold tracking-tight', dark ? 'text-white' : 'text-ink-950')}>
        Voyago
      </span>
    </Link>
  );
}
