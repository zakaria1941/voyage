import type { BookingType } from './common';

export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minimumAmount: number;
  expirationDate: number;
  usageLimit: number;
  usageCount: number;
  applicableServices: (BookingType | 'all')[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CouponInput = Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;
