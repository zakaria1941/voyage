import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Coupon, CouponInput } from '@/types/coupon';
import type { BookingType } from '@/types/common';
import { checkCouponEligibility } from '@/utils/booking';
import { calculateCouponDiscount } from '@/utils/pricing';
import { mapDoc, mapDocs } from './firestoreUtils';

const couponsCol = () => collection(db, 'coupons');

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const snap = await getDocs(query(couponsCol(), where('code', '==', code.trim().toUpperCase()), limit(1)));
  return snap.empty ? null : mapDoc<Coupon>(snap.docs[0]);
}

export interface CouponPreview {
  eligible: boolean;
  reason?: string;
  discount: number;
}

/**
 * UI-only "Apply coupon" preview for checkout — reads the coupon doc directly
 * (coupons are readable by any signed-in user) and reuses the same
 * eligibility/discount logic the server uses. This is display convenience
 * only: it is NOT the source of truth. The `create-booking` Netlify Function
 * re-validates the coupon and increments its usage count itself, from
 * scratch, and never trusts this preview — see netlify/lib/booking.ts.
 */
export async function previewCoupon(code: string, service: BookingType, amount: number): Promise<CouponPreview> {
  const coupon = await getCouponByCode(code);
  const result = checkCouponEligibility(coupon, service, amount);
  if (!result.eligible) return { eligible: false, reason: result.reason, discount: 0 };
  return { eligible: true, discount: calculateCouponDiscount(amount, coupon) };
}

export async function listCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(query(couponsCol(), orderBy('createdAt', 'desc')));
  return mapDocs<Coupon>(snap);
}

export async function createCoupon(input: CouponInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(couponsCol(), { ...input, code: input.code.trim().toUpperCase(), usageCount: 0, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...input, updatedAt: Date.now() };
  if (input.code) patch.code = input.code.trim().toUpperCase();
  await updateDoc(doc(db, 'coupons', id), patch);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', id));
}
