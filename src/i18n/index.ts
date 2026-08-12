import { en, type TranslationKey } from './en';
import { fr } from './fr';
import { es } from './es';
import { ar } from './ar';
import type { LanguageCode } from '@/context/LanguageContext';

export type { TranslationKey };

const dictionaries: Record<LanguageCode, Record<TranslationKey, string>> = { en, fr, es, ar };

/** Replaces `{param}` placeholders — e.g. interpolate('Hi {name}', {name: 'Sam'}) -> 'Hi Sam'. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/** Looks up `key` in `language`'s dictionary, falling back to English if somehow absent, then to the key itself. */
export function translate(language: LanguageCode, key: TranslationKey, params?: Record<string, string | number>): string {
  const template = dictionaries[language]?.[key] ?? en[key] ?? key;
  return interpolate(template, params);
}
