import { cn } from '@/utils/cn';

interface SortTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SortTabs<T extends string>({ options, value, onChange }: SortTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Sort results">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === opt.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
