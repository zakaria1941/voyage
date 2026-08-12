import { useRef, useState } from 'react';
import { Check, ChevronDown, Wallet } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { CURRENCIES } from '@/types/common';
import { cn } from '@/utils/cn';

export function CurrencySelector({ className, dark }: { className?: string; dark?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const { t, isRtl } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.currency')}
        className={cn(
          'flex items-center gap-1.5 rounded-lg py-2 pl-2 pr-2.5 text-sm font-medium transition-colors',
          dark ? 'text-white hover:bg-white/10' : 'text-ink-700 hover:bg-ink-100',
        )}
      >
        <Wallet className={cn('size-4', dark ? 'text-white/80' : 'text-ink-500')} aria-hidden="true" />
        <span>{currency}</span>
        <ChevronDown className={cn('size-3.5', dark ? 'text-white/70' : 'text-ink-400')} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 w-32 animate-scale-in origin-top-right rounded-2xl border border-ink-100 bg-white p-1.5 shadow-lifted',
            isRtl ? 'left-0 origin-top-left' : 'right-0',
          )}
        >
          {CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              role="menuitemradio"
              aria-checked={c === currency}
              onClick={() => { setCurrency(c); setOpen(false); }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                c === currency ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50',
              )}
            >
              {c}
              {c === currency && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
