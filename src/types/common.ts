export type Currency = 'EUR' | 'USD' | 'DZD' | 'GBP';

export type BookingType = 'flight' | 'hotel' | 'car' | 'transfer';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export type UserRole = 'user' | 'admin';

export interface Pricing {
  basePrice: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: Currency;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const CURRENCIES: Currency[] = ['EUR', 'USD', 'DZD', 'GBP'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  DZD: 'DA',
  GBP: '£',
};
