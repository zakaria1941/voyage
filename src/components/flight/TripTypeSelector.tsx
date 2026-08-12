import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import type { TripType } from '@/types/search';
import { cn } from '@/utils/cn';

const OPTIONS: { value: TripType; labelKey: TranslationKey }[] = [
  { value: 'roundtrip', labelKey: 'search.tripType.roundtrip' },
  { value: 'oneway', labelKey: 'search.tripType.oneway' },
  { value: 'multicity', labelKey: 'search.tripType.multicity' },
];

export function TripTypeSelector({ value, onChange }: { value: TripType; onChange: (v: TripType) => void }) {
  const { t } = useLanguage();
  return (
    <div role="radiogroup" aria-label={t('search.tripType.ariaLabel')} className="inline-flex rounded-lg bg-ink-100 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === opt.value ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
