import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'brand' | 'accent' | 'success' | 'warning';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
};

export function StatCard({ icon: Icon, label, value, tone = 'brand' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <span className={cn('flex size-10 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
        <Icon className="size-5" />
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-ink-950">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
