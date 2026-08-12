import { useRef, useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { CounterStepper } from './CounterStepper';
import { useLanguage } from '@/context/LanguageContext';
import type { CabinClass, PassengerCounts } from '@/types/search';
import { CABIN_LABEL_KEYS } from '@/types/search';
import { cn } from '@/utils/cn';

interface PassengersPopoverProps {
  passengers: PassengerCounts;
  cabin: CabinClass;
  onChange: (passengers: PassengerCounts, cabin: CabinClass) => void;
}

export function PassengersPopover({ passengers, cabin, onChange }: PassengersPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const { t } = useLanguage();

  const total = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-xl border border-ink-200 bg-white px-3.5 text-left text-sm',
          'transition-colors hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40',
        )}
      >
        <Users className="size-4 shrink-0 text-ink-400" />
        <span className="min-w-0 flex-1 truncate text-ink-900">
          {total} {total === 1 ? t('common.passenger') : t('common.passengers')} · {t(CABIN_LABEL_KEYS[cabin])}
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-400" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('search.passengers.popoverAriaLabel')}
          className="absolute left-0 z-30 mt-2 w-80 animate-scale-in origin-top-left rounded-2xl border border-ink-100 bg-white p-4 shadow-lifted"
        >
          <div className="divide-y divide-ink-100">
            <CounterStepper
              label={t('search.passengers.adults')}
              sublabel={t('search.passengers.adultsAge')}
              value={passengers.adults}
              min={1}
              max={9}
              onChange={(v) => onChange({ ...passengers, adults: v }, cabin)}
            />
            <CounterStepper
              label={t('search.passengers.children')}
              sublabel={t('search.passengers.childrenAge')}
              value={passengers.children}
              max={8}
              onChange={(v) => onChange({ ...passengers, children: v }, cabin)}
            />
            <CounterStepper
              label={t('search.passengers.infants')}
              sublabel={t('search.passengers.infantsAge')}
              value={passengers.infants}
              max={passengers.adults}
              onChange={(v) => onChange({ ...passengers, infants: v }, cabin)}
            />
          </div>
          <div className="mt-3 border-t border-ink-100 pt-3">
            <p className="mb-2 text-sm font-medium text-ink-900">{t('search.passengers.cabinClass')}</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CABIN_LABEL_KEYS) as CabinClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(passengers, c)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    cabin === c
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300',
                  )}
                >
                  {t(CABIN_LABEL_KEYS[c])}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {t('common.done')}
          </button>
        </div>
      )}
    </div>
  );
}
