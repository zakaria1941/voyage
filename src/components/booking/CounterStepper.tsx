import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CounterStepperProps {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function CounterStepper({ label, sublabel, value, min = 0, max = 9, onChange }: CounterStepperProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {sublabel && <p className="text-xs text-ink-500">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
          className={cn(
            'flex size-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-all',
            'hover:border-brand-400 hover:text-brand-700 hover:shadow-sm active:scale-95',
            'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-200 disabled:hover:text-ink-600 disabled:hover:shadow-none disabled:active:scale-100',
          )}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-ink-900 tabular-nums">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label}`}
          className={cn(
            'flex size-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-all',
            'hover:border-brand-400 hover:text-brand-700 hover:shadow-sm active:scale-95',
            'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-200 disabled:hover:text-ink-600 disabled:hover:shadow-none disabled:active:scale-100',
          )}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
