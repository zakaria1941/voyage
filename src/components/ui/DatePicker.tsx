import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore,
  isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { ar, es, fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/utils/cn';

const DATE_FNS_LOCALES = { en: undefined, fr, es, ar } as const;

const POPOVER_WIDTH = 304; // matches the previous w-[19rem]
const ESTIMATED_POPOVER_HEIGHT = 380; // used only for the first paint, before the real height is measured
const GAP = 8; // matches the previous mt-2
const VIEWPORT_MARGIN = 8;

interface Position {
  top: number;
  left: number;
  placement: 'below' | 'above';
}

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function DatePicker({ id, value, onChange, min, max, icon, disabled, className, 'aria-label': ariaLabel }: DatePickerProps) {
  const { language, t, isRtl } = useLanguage();
  const locale = DATE_FNS_LOCALES[language];
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? parseISO(value) : new Date()));
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;

  function isDisabled(d: Date): boolean {
    if (minDate && isBefore(d, minDate)) return true;
    if (maxDate && isAfter(d, maxDate)) return true;
    return false;
  }

  /**
   * Positions the popover with `position: fixed` in viewport coordinates
   * (measured from the trigger button) instead of `position: absolute`
   * inside the normal document flow. This is what lets it render via a
   * portal and escape any ancestor's `overflow: hidden` — e.g. the
   * homepage hero section, which clips absolutely-positioned descendants
   * that extend past its bottom edge. Flips above the trigger, and clamps
   * horizontally, when there isn't enough viewport room.
   */
  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const popoverHeight = popoverRef.current?.offsetHeight ?? ESTIMATED_POPOVER_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: Position['placement'] = spaceBelow >= popoverHeight + GAP || spaceBelow >= spaceAbove ? 'below' : 'above';
    const top = placement === 'below' ? rect.bottom + GAP : rect.top - GAP - popoverHeight;

    const naturalLeft = isRtl ? rect.right - POPOVER_WIDTH : rect.left;
    const left = Math.min(Math.max(naturalLeft, VIEWPORT_MARGIN), window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN);

    setPosition({ top, left, placement });
  }

  function handleToggle() {
    if (disabled) return;
    if (!open) {
      setViewMonth(selectedDate ?? new Date());
      updatePosition();
    }
    setOpen((v) => !v);
  }

  function handleSelect(d: Date) {
    if (isDisabled(d)) return;
    onChange(format(d, 'yyyy-MM-dd'));
    setOpen(false);
  }

  // Re-measure once the popover has actually rendered (real height available)
  // and again whenever the visible month changes, since a 5-row vs 6-row
  // month grid changes the popover's height.
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewMonth]);

  useEffect(() => {
    if (!open) return;

    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleReposition() {
      updatePosition();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayLabels = days.slice(0, 7).map((d) => format(d, 'EEEEEE', { locale }));
  const prevMonthDisabled = Boolean(minDate) && isBefore(endOfMonth(subMonths(viewMonth, 1)), minDate!);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-xl border border-ink-200 bg-white px-3.5 text-left text-sm text-ink-900',
          'transition-colors hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className,
        )}
      >
        {icon && <span className="shrink-0 text-ink-400">{icon}</span>}
        <span className="min-w-0 flex-1 truncate">
          {selectedDate ? format(selectedDate, 'EEE, d MMM yyyy', { locale }) : t('common.date')}
        </span>
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={ariaLabel ?? t('common.date')}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            position: 'fixed',
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            width: POPOVER_WIDTH,
            visibility: position ? 'visible' : 'hidden',
          }}
          className={cn(
            'z-50 animate-scale-in rounded-2xl border border-ink-100 bg-white p-4 shadow-lifted',
            position?.placement === 'above' ? 'origin-bottom' : 'origin-top',
          )}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              disabled={prevMonthDisabled}
              aria-label={t('datePicker.previousMonth')}
              className="flex size-8 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-200 disabled:hover:text-ink-600 rtl:rotate-180"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="font-display text-sm font-semibold capitalize text-ink-900">{format(viewMonth, 'MMMM yyyy', { locale })}</p>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              aria-label={t('datePicker.nextMonth')}
              className="flex size-8 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700 rtl:rotate-180"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {weekdayLabels.map((label, i) => (
              <span key={i} className="flex h-8 items-center justify-center truncate text-[11px] font-medium uppercase text-ink-400">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const disabledDay = isDisabled(d);
              const selected = selectedDate && isSameDay(d, selectedDate);
              const today = isToday(d);
              const outsideMonth = !isSameMonth(d, viewMonth);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => handleSelect(d)}
                  disabled={disabledDay}
                  aria-current={today ? 'date' : undefined}
                  aria-pressed={selected}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full text-sm transition-colors',
                    outsideMonth && 'text-ink-300',
                    !outsideMonth && !selected && 'text-ink-700 hover:bg-brand-50',
                    today && !selected && 'font-semibold text-brand-700 ring-1 ring-inset ring-brand-300',
                    selected && 'bg-brand-700 font-semibold text-white shadow-sm hover:bg-brand-700',
                    disabledDay && 'cursor-not-allowed text-ink-300 opacity-40 hover:bg-transparent',
                  )}
                >
                  {format(d, 'd')}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
