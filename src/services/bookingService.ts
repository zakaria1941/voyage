import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { callFunction } from '@/lib/apiClient';
import type { Booking, CreateBookingRequest, CreateBookingResponse } from '@/types/booking';
import { mapDoc, mapDocs } from './firestoreUtils';

const bookingsCol = () => collection(db, 'bookings');

/**
 * Booking creation always goes through the `create-booking` Netlify
 * Function. It runs with Admin SDK privileges, recomputes pricing from
 * canonical inventory data (never trusting a price from the client),
 * validates any coupon server-side, and performs the availability check +
 * inventory reservation inside a single Firestore transaction.
 * See netlify/lib/booking.ts.
 */
export async function createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
  return callFunction<CreateBookingResponse>('create-booking', request);
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, 'bookings', id));
  return snap.exists() ? mapDoc<Booking>(snap) : null;
}

export async function listMyBookings(userId: string): Promise<Booking[]> {
  const snap = await getDocs(query(bookingsCol(), where('userId', '==', userId), orderBy('createdAt', 'desc')));
  return mapDocs<Booking>(snap);
}

export async function listAllBookings(max = 100): Promise<Booking[]> {
  const snap = await getDocs(query(bookingsCol(), orderBy('createdAt', 'desc'), fsLimit(max)));
  return mapDocs<Booking>(snap);
}

/**
 * Owner-initiated cancellation. Goes through the `cancel-booking` Netlify
 * Function rather than a direct Firestore write: for flights, it restores
 * the exact seat count the booking reserved (read server-side from the
 * booking document, never trusted from the client) atomically with the
 * status change. See netlify/lib/booking.ts.
 */
export async function cancelBooking(id: string, reason: string): Promise<void> {
  await callFunction('cancel-booking', { bookingId: id, reason });
}

/** Admin-only: broader status/payment transitions. Cancelling still goes through the Function (for flight seat restoration); other transitions are plain writes. */
export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
  paymentStatus?: Booking['paymentStatus'],
): Promise<void> {
  if (status === 'cancelled') {
    await callFunction('cancel-booking', { bookingId: id, reason: 'Cancelled by admin', paymentStatus: paymentStatus ?? 'refunded' });
    return;
  }
  const patch: Record<string, unknown> = { status, updatedAt: Date.now() };
  if (paymentStatus) patch.paymentStatus = paymentStatus;
  await updateDoc(doc(db, 'bookings', id), patch);
}

export async function hasCompletedBookingForItem(userId: string, itemId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(
      bookingsCol(),
      where('userId', '==', userId),
      where('itemId', '==', itemId),
      where('status', '==', 'completed'),
    ),
  );
  return mapDocs<Booking>(snap);
}
