import type { Coupon } from '@/types/coupon';
import type { BookingType } from '@/types/common';
import type { Booking, FlightBookingDetails, HotelBookingDetails, CarBookingDetails, TransferBookingDetails } from '@/types/booking';

const REFERENCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generates a demo booking reference like "TRV-2026-8K4QZ1". Never used for real reservations. */
export function generateBookingReference(now: Date = new Date()): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += REFERENCE_CHARS[Math.floor(Math.random() * REFERENCE_CHARS.length)];
  }
  return `TRV-${now.getFullYear()}-${suffix}`;
}

export interface CouponEligibility {
  eligible: boolean;
  reason?: string;
}

export function checkCouponEligibility(coupon: Coupon | null | undefined, service: BookingType, amount: number, now = Date.now()): CouponEligibility {
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

/** Derives a short title + destination-style subtitle for a booking, for list/card display. */
export function describeBooking(booking: Booking): { title: string; subtitle: string } {
  switch (booking.bookingType) {
    case 'flight': {
      const d = booking.details as FlightBookingDetails;
      return { title: 'Flight', subtitle: d.returnFlightId ? 'Round trip' : 'One way' };
    }
    case 'hotel': {
      const d = booking.details as HotelBookingDetails;
      return { title: d.hotelName, subtitle: d.roomName };
    }
    case 'car': {
      const d = booking.details as CarBookingDetails;
      return { title: d.carName, subtitle: d.pickupLocation };
    }
    case 'transfer': {
      const d = booking.details as TransferBookingDetails;
      return { title: `${d.vehicleName} transfer`, subtitle: `${d.pickupAddress} → ${d.dropoffAddress}` };
    }
    default:
      return { title: 'Booking', subtitle: '' };
  }
}
