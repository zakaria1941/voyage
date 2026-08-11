import type { BookingType } from './bookingTypes';

export interface CouponDoc {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumAmount: number;
  expirationDate: number;
  usageLimit: number;
  usageCount: number;
  applicableServices: (BookingType | 'all')[];
  active: boolean;
}

export interface CouponEligibility {
  eligible: boolean;
  reason?: string;
}

export function checkCouponEligibility(
  coupon: CouponDoc | null | undefined,
  service: BookingType,
  amount: number,
  now = Date.now(),
): CouponEligibility {
  if (!coupon) return { eligible: false, reason: 'Coupon code not found.' };
  if (!coupon.active) return { eligible: false, reason: 'This coupon is no longer active.' };
  if (coupon.expirationDate < now) return { eligible: false, reason: 'This coupon has expired.' };
  if (coupon.usageCount >= coupon.usageLimit) return { eligible: false, reason: 'This coupon has reached its usage limit.' };
  if (!coupon.applicableServices.includes('all') && !coupon.applicableServices.includes(service)) {
    return { eligible: false, reason: 'This coupon isn’t valid for this service.' };
  }
  if (amount < coupon.minimumAmount) {
    return { eligible: false, reason: `Minimum booking amount is €${coupon.minimumAmount.toFixed(0)} for this coupon.` };
  }
  return { eligible: true };
}
