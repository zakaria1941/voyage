import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translate, type TranslationKey } from '@/i18n';

export type LanguageCode = 'en' | 'fr' | 'es' | 'ar';

export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
];

export const RTL_LANGUAGES: readonly LanguageCode[] = ['ar'];

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  isRtl: boolean;
  /** Translates `key` into the active language, with optional {param} interpolation. See src/i18n/en.ts for available keys. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'voyago:language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return 'en';
    return (window.localStorage.getItem(STORAGE_KEY) as LanguageCode) || 'en';
  });

  const isRtl = RTL_LANGUAGES.includes(language);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      isRtl,
      t: (key, params) => translate(language, key, params),
    }),
    [language, isRtl],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
