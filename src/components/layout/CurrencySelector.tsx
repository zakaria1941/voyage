import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCIES } from '@/types/common';
import { cn } from '@/utils/cn';

export function CurrencySelector({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className={cn('relative', className)}>
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
        className="cursor-pointer appearance-none rounded-lg bg-transparent py-2 pl-2 pr-5 text-sm font-medium text-ink-700 hover:bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
        aria-label="Select currency"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
