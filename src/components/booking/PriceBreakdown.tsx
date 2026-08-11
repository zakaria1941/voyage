import { useCurrency } from '@/context/CurrencyContext';
import type { Pricing } from '@/types/common';
import { cn } from '@/utils/cn';

export function PriceBreakdown({ pricing, lines, className }: { pricing: Pricing; lines?: string[]; className?: string }) {
  const { format } = useCurrency();

  return (
    <div className={cn('rounded-2xl border border-ink-100 bg-white p-5 shadow-soft', className)}>
      <h3 className="font-display text-base font-semibold text-ink-950">Price breakdown</h3>
      {lines && lines.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-ink-500">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
      <dl className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Base price</dt>
          <dd className="text-ink-800">{format(pricing.basePrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Taxes</dt>
          <dd className="text-ink-800">{format(pricing.taxes)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Service fee</dt>
          <dd className="text-ink-800">{format(pricing.fees)}</dd>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-success-600">
            <dt>Discount</dt>
            <dd>-{format(pricing.discount)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="font-display text-base font-semibold text-ink-950">Total</span>
        <span className="font-display text-xl font-bold text-brand-800">{format(pricing.total)}</span>
      </div>
    </div>
  );
}
