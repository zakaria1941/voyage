import { useRef, useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { CounterStepper } from './CounterStepper';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/utils/cn';

interface GuestsPopoverProps {
  rooms: number;
  adults: number;
  children: number;
  onChange: (values: { rooms: number; adults: number; children: number }) => void;
}

export function GuestsPopover({ rooms, adults, children, onChange }: GuestsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const { t } = useLanguage();

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
          {rooms} {rooms === 1 ? t('search.hotels.room') : t('search.hotels.rooms')} · {adults + children} {adults + children === 1 ? t('common.guest') : t('common.guests')}
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-400" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('search.hotels.roomsAndGuestsAriaLabel')}
          className="absolute left-0 z-30 mt-2 w-72 animate-scale-in origin-top-left rounded-2xl border border-ink-100 bg-white p-4 shadow-lifted"
        >
          <div className="divide-y divide-ink-100">
            <CounterStepper label={t('search.hotels.rooms')} value={rooms} min={1} max={8} onChange={(v) => onChange({ rooms: v, adults, children })} />
            <CounterStepper label={t('search.passengers.adults')} sublabel={t('search.passengers.adultsAge')} value={adults} min={1} max={16} onChange={(v) => onChange({ rooms, adults: v, children })} />
            <CounterStepper label={t('search.passengers.children')} sublabel={t('search.passengers.childrenAge')} value={children} max={8} onChange={(v) => onChange({ rooms, adults, children: v })} />
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
