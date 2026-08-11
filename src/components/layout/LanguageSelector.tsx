import { Languages } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';
import { cn } from '@/utils/cn';

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <label className={cn('relative inline-flex items-center gap-1 rounded-lg py-2 pl-2 pr-1 text-sm font-medium text-ink-700 hover:bg-ink-100', className)}>
      <Languages className="size-4 text-ink-500" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-ink-700 focus:outline-none"
        aria-label="Select language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
