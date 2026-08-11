import type { Currency } from '@/types/common';
import { CURRENCY_SYMBOLS } from '@/types/common';

/**
 * Static demo exchange rates, quoted as "1 EUR = X <currency>".
 * EUR is the canonical storage currency for all prices in Firestore.
 * These are NOT live rates — see README "Currency" section. A real
 * integration would swap this module for a live exchange-rate API
 * behind the same `convert()` signature.
 */
const DEMO_RATES_FROM_EUR: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  DZD: 146.5,
};

export function convertFromEur(amountInEur: number, target: Currency): number {
  return amountInEur * DEMO_RATES_FROM_EUR[target];
}

export function formatMoney(amountInEur: number, currency: Currency, options?: { showCode?: boolean }): string {
  const converted = convertFromEur(amountInEur, currency);
  const decimals = currency === 'DZD' ? 0 : 2;
  const formatted = converted.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const symbol = CURRENCY_SYMBOLS[currency];
  const withSymbol = currency === 'DZD' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  return options?.showCode ? `${withSymbol} (${currency})` : withSymbol;
}
