/**
 * Server-side pricing engine — the authoritative counterpart to
 * src/utils/pricing.ts. Kept as a small, dependency-free duplicate (rather
 * than a shared import) because netlify/functions is bundled independently
 * of the Vite app. This is the ONLY version that actually determines what
 * gets charged; the client copy is for live preview only.
 */
export type Currency = 'EUR' | 'USD' | 'DZD' | 'GBP';

export interface Pricing {
  basePrice: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: Currency;
}

export interface CouponLike {
  type: 'percentage' | 'fixed';
  value: number;
}

const TAX_RATE = 0.1;
const SERVICE_FEE = 6;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDiscount(basePrice: number, coupon: CouponLike | null | undefined): number {
  if (!coupon) return 0;
  const discount = coupon.type === 'percentage' ? (basePrice * coupon.value) / 100 : coupon.value;
  return round2(Math.min(discount, basePrice));
}

export function buildPricing(basePrice: number, coupon?: CouponLike | null): Pricing {
  const roundedBase = round2(basePrice);
  const taxes = round2(roundedBase * TAX_RATE);
  const fees = SERVICE_FEE;
  const discount = calculateDiscount(roundedBase, coupon);
  const total = round2(Math.max(0, roundedBase + taxes + fees - discount));
  return { basePrice: roundedBase, taxes, fees, discount, total, currency: 'EUR' };
}
