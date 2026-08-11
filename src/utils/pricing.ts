import type { Pricing } from '@/types/common';
import type { Coupon } from '@/types/coupon';

/**
 * Shared pricing engine. All amounts are computed and stored in EUR (the
 * canonical currency — see README "Currency"); the selected display
 * currency only affects rendering via `useCurrency().format()`.
 *
 * This module is intentionally pure/dependency-free so its logic can be
 * mirrored in the `createBooking` Cloud Function, which recomputes the
 * same totals server-side and never trusts a price sent by the client.
 */
const TAX_RATE = 0.1;
const SERVICE_FEE = 6;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCouponDiscount(basePrice: number, coupon: Coupon | null | undefined): number {
  if (!coupon) return 0;
  const discount = coupon.type === 'percentage' ? (basePrice * coupon.value) / 100 : coupon.value;
  return round2(Math.min(discount, basePrice));
}

function buildPricing(basePrice: number, coupon?: Coupon | null): Pricing {
  const roundedBase = round2(basePrice);
  const taxes = round2(roundedBase * TAX_RATE);
  const fees = SERVICE_FEE;
  const discount = calculateCouponDiscount(roundedBase, coupon);
  const total = round2(Math.max(0, roundedBase + taxes + fees - discount));
  return { basePrice: roundedBase, taxes, fees, discount, total, currency: 'EUR' };
}

export function calculateFlightPrice(pricePerPassenger: number, passengerCount: number, coupon?: Coupon | null): Pricing {
  return buildPricing(pricePerPassenger * Math.max(1, passengerCount), coupon);
}

export function calculateHotelPrice(pricePerNight: number, nights: number, rooms: number, coupon?: Coupon | null): Pricing {
  return buildPricing(pricePerNight * Math.max(1, nights) * Math.max(1, rooms), coupon);
}

export function calculateCarRentalPrice(pricePerDay: number, days: number, coupon?: Coupon | null): Pricing {
  return buildPricing(pricePerDay * Math.max(1, days), coupon);
}

export function calculateTransferPrice(pricePerTrip: number, coupon?: Coupon | null): Pricing {
  return buildPricing(pricePerTrip, coupon);
}
