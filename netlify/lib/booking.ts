/**
 * Core booking-creation business logic, ported from the old
 * functions/src/booking.ts Cloud Function. Runs with Admin SDK privileges
 * (bypassing Firestore rules by design — see firestore.rules header), and
 * is the ONLY code path allowed to write to the `bookings` collection.
 *
 * Never trusts the client for price, availability, or seat/unit counts —
 * everything here is recomputed from canonical Firestore inventory inside a
 * single transaction, which is what actually prevents double-booking under
 * concurrency (Firestore rules alone cannot express a cross-document
 * overlap check like `countOverlappingUnits`).
 */
import {
  FieldValue,
  type Transaction,
  type Firestore,
  type DocumentData,
  type DocumentReference,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getAdminDb } from './firebaseAdmin';
import { buildPricing, type Pricing } from './pricing';
import { checkCouponEligibility, type CouponDoc } from './coupon';
import { HttpError } from './httpError';
import type {
  BookingType,
  CreateBookingRequest,
  CustomerInfo,
  FlightBookingDetails,
  HotelBookingDetails,
  CarBookingDetails,
  TransferBookingDetails,
  BookingDetails,
} from './bookingTypes';

const REFERENCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateBookingReference(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += REFERENCE_CHARS[Math.floor(Math.random() * REFERENCE_CHARS.length)];
  return `TRV-${new Date().getFullYear()}-${suffix}`;
}

type CouponSnap = QueryDocumentSnapshot<DocumentData>;

interface FinalizeOptions {
  uid: string;
  bookingType: BookingType;
  itemId: string;
  startDate: number;
  endDate: number;
  guests: number;
  customerInfo: CustomerInfo;
  details: BookingDetails;
  specialRequests?: string;
  pricing: Pricing;
  couponSnap: CouponSnap | null;
}

function finalizeBooking(
  tx: Transaction,
  db: Firestore,
  opts: FinalizeOptions,
): { bookingId: string; bookingReference: string; pricing: Pricing } {
  const bookingRef = db.collection('bookings').doc();
  const bookingReference = generateBookingReference();
  const now = Date.now();

  tx.set(bookingRef, {
    userId: opts.uid,
    bookingType: opts.bookingType,
    itemId: opts.itemId,
    status: 'confirmed',
    paymentStatus: 'paid',
    startDate: opts.startDate,
    endDate: opts.endDate,
    guests: opts.guests,
    customerInfo: opts.customerInfo,
    details: opts.details,
    pricing: opts.pricing,
    couponCode: opts.couponSnap ? (opts.couponSnap.data() as CouponDoc).code : null,
    bookingReference,
    specialRequests: opts.specialRequests || null,
    cancellationReason: null,
    createdAt: now,
    updatedAt: now,
  });

  if (opts.couponSnap) {
    tx.update(opts.couponSnap.ref, { usageCount: FieldValue.increment(1) });
  }

  tx.set(db.collection('notifications').doc(), {
    userId: opts.uid,
    title: 'Booking confirmed',
    message: `Your ${opts.bookingType} booking (${bookingReference}) has been confirmed.`,
    type: 'booking_confirmed',
    read: false,
    relatedBookingId: bookingRef.id,
    createdAt: now,
  });

  return { bookingId: bookingRef.id, bookingReference, pricing: opts.pricing };
}

/** Fails loudly on an invalid coupon rather than silently dropping the discount the client previewed. */
function resolveCoupon(couponSnap: CouponSnap | null, requestedCode: string | undefined, service: BookingType, amount: number): CouponSnap | null {
  if (!requestedCode) return null;
  if (!couponSnap) throw new HttpError('failed-precondition', 'That coupon code doesn’t exist.');
  const coupon = couponSnap.data() as CouponDoc;
  const result = checkCouponEligibility(coupon, service, amount);
  if (!result.eligible) throw new HttpError('failed-precondition', result.reason || 'This coupon can’t be applied.');
  return couponSnap;
}

/** Sums units already reserved for `itemId` that overlap [startDate, endDate), excluding cancelled bookings. */
async function countOverlappingUnits(
  tx: Transaction,
  db: Firestore,
  itemId: string,
  startDate: number,
  endDate: number,
  getUnits: (data: DocumentData) => number = () => 1,
): Promise<number> {
  const overlapQuery = db
    .collection('bookings')
    .where('itemId', '==', itemId)
    .where('startDate', '<', endDate)
    .where('endDate', '>', startDate);
  const snap = await tx.get(overlapQuery);
  return snap.docs
    .filter((d) => d.data().status !== 'cancelled')
    .reduce((sum, d) => sum + getUnits(d.data()), 0);
}

async function bookFlight(tx: Transaction, db: Firestore, uid: string, data: CreateBookingRequest, couponSnap: CouponSnap | null) {
  const details = data.details as FlightBookingDetails;
  const passengerCount = details.passengers?.length || data.guests || 1;

  const flightRef = db.collection('flights').doc(data.itemId);
  const flightSnap = await tx.get(flightRef);
  if (!flightSnap.exists) throw new HttpError('not-found', 'This flight is no longer available.');
  const flight = flightSnap.data()!;
  const fare = flight.fares?.[details.cabin];
  if (!fare) throw new HttpError('failed-precondition', 'That cabin class is not available on this flight.');
  if (fare.seatsAvailable < passengerCount) {
    throw new HttpError('failed-precondition', 'Not enough seats left on this flight for your party.');
  }

  let returnFlightRef: DocumentReference | null = null;
  let returnFare: { price: number; seatsAvailable: number } | null = null;
  if (details.returnFlightId) {
    returnFlightRef = db.collection('flights').doc(details.returnFlightId);
    const returnSnap = await tx.get(returnFlightRef);
    if (!returnSnap.exists) throw new HttpError('not-found', 'The return flight is no longer available.');
    const returnFlight = returnSnap.data()!;
    returnFare = returnFlight.fares?.[details.cabin];
    if (!returnFare) throw new HttpError('failed-precondition', 'That cabin class is not available on the return flight.');
    if (returnFare.seatsAvailable < passengerCount) {
      throw new HttpError('failed-precondition', 'Not enough seats left on the return flight for your party.');
    }
  }

  const basePrice = fare.price * passengerCount + (returnFare ? returnFare.price * passengerCount : 0);
  const validCoupon = resolveCoupon(couponSnap, data.couponCode, 'flight', basePrice);
  const pricing = buildPricing(basePrice, validCoupon ? (validCoupon.data() as CouponDoc) : null);

  tx.update(flightRef, {
    [`fares.${details.cabin}.seatsAvailable`]: FieldValue.increment(-passengerCount),
    updatedAt: Date.now(),
  });
  if (returnFlightRef) {
    tx.update(returnFlightRef, {
      [`fares.${details.cabin}.seatsAvailable`]: FieldValue.increment(-passengerCount),
      updatedAt: Date.now(),
    });
  }

  return finalizeBooking(tx, db, {
    uid,
    bookingType: 'flight',
    itemId: data.itemId,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: passengerCount,
    customerInfo: data.customerInfo,
    details,
    specialRequests: data.specialRequests,
    pricing,
    couponSnap: validCoupon,
  });
}

async function bookHotel(tx: Transaction, db: Firestore, uid: string, data: CreateBookingRequest, couponSnap: CouponSnap | null) {
  const details = data.details as HotelBookingDetails;
  const requestedRooms = Math.max(1, details.rooms || 1);

  const roomRef = db.collection('hotels').doc(details.hotelId).collection('rooms').doc(details.roomId);
  const roomSnap = await tx.get(roomRef);
  if (!roomSnap.exists) throw new HttpError('not-found', 'This room is no longer available.');
  const room = roomSnap.data()!;

  const bookedUnits = await countOverlappingUnits(tx, db, details.roomId, data.startDate, data.endDate, (d) => Number(d.details?.rooms) || 1);
  if (bookedUnits + requestedRooms > (room.totalUnits || 1)) {
    throw new HttpError('failed-precondition', 'Sorry, this room is no longer available for your selected dates.');
  }

  const nights = Math.max(1, Math.round((data.endDate - data.startDate) / 86400000));
  const basePrice = room.pricePerNight * nights * requestedRooms;
  const validCoupon = resolveCoupon(couponSnap, data.couponCode, 'hotel', basePrice);
  const pricing = buildPricing(basePrice, validCoupon ? (validCoupon.data() as CouponDoc) : null);

  return finalizeBooking(tx, db, {
    uid,
    bookingType: 'hotel',
    itemId: details.roomId,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: data.guests,
    customerInfo: data.customerInfo,
    details: { ...details, nights, rooms: requestedRooms },
    specialRequests: data.specialRequests,
    pricing,
    couponSnap: validCoupon,
  });
}

async function bookCar(tx: Transaction, db: Firestore, uid: string, data: CreateBookingRequest, couponSnap: CouponSnap | null) {
  const details = data.details as CarBookingDetails;

  const carRef = db.collection('cars').doc(data.itemId);
  const carSnap = await tx.get(carRef);
  if (!carSnap.exists) throw new HttpError('not-found', 'This car is no longer available.');
  const car = carSnap.data()!;

  const bookedUnits = await countOverlappingUnits(tx, db, data.itemId, data.startDate, data.endDate);
  if (bookedUnits + 1 > (car.totalUnits || 1)) {
    throw new HttpError('failed-precondition', 'Sorry, this car is no longer available for your selected dates.');
  }
  if (details.driverAge < (car.minDriverAge || 18)) {
    throw new HttpError('failed-precondition', `The minimum driver age for this car is ${car.minDriverAge}.`);
  }

  const days = Math.max(1, Math.ceil((data.endDate - data.startDate) / 86400000));
  const basePrice = car.pricePerDay * days;
  const validCoupon = resolveCoupon(couponSnap, data.couponCode, 'car', basePrice);
  const pricing = buildPricing(basePrice, validCoupon ? (validCoupon.data() as CouponDoc) : null);

  return finalizeBooking(tx, db, {
    uid,
    bookingType: 'car',
    itemId: data.itemId,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: data.guests,
    customerInfo: data.customerInfo,
    details,
    specialRequests: data.specialRequests,
    pricing,
    couponSnap: validCoupon,
  });
}

const TRANSFER_SLOT_BUFFER_MS = 2 * 60 * 60 * 1000;

async function bookTransfer(tx: Transaction, db: Firestore, uid: string, data: CreateBookingRequest, couponSnap: CouponSnap | null) {
  const details = data.details as TransferBookingDetails;

  const transferRef = db.collection('transfers').doc(data.itemId);
  const transferSnap = await tx.get(transferRef);
  if (!transferSnap.exists) throw new HttpError('not-found', 'This transfer is no longer available.');
  const transfer = transferSnap.data()!;

  if (details.passengers > (transfer.maxPassengers || 99)) {
    throw new HttpError('failed-precondition', 'This vehicle doesn’t have enough seats for your party.');
  }

  const slotEnd = data.startDate + TRANSFER_SLOT_BUFFER_MS;
  const bookedUnits = await countOverlappingUnits(tx, db, data.itemId, data.startDate, slotEnd);
  if (bookedUnits + 1 > (transfer.totalUnits || 1)) {
    throw new HttpError('failed-precondition', 'Sorry, this transfer is fully booked for your selected time.');
  }

  const basePrice = transfer.pricePerTrip;
  const validCoupon = resolveCoupon(couponSnap, data.couponCode, 'transfer', basePrice);
  const pricing = buildPricing(basePrice, validCoupon ? (validCoupon.data() as CouponDoc) : null);

  return finalizeBooking(tx, db, {
    uid,
    bookingType: 'transfer',
    itemId: data.itemId,
    startDate: data.startDate,
    endDate: slotEnd,
    guests: details.passengers,
    customerInfo: data.customerInfo,
    details,
    specialRequests: data.specialRequests,
    pricing,
    couponSnap: validCoupon,
  });
}

interface CancelOptions {
  bookingId: string;
  reason?: string;
  /** Admin-only broader transition; customer-initiated cancellation never sets this (matches pre-existing behavior). */
  paymentStatus?: string;
}

/**
 * Cancels a booking and, for flights only, restores the exact seat count the
 * original booking reserved — read from the booking document itself, never
 * from the request. Runs inside a transaction so a concurrent duplicate
 * cancel attempt is guaranteed to see the already-cancelled status on retry
 * (Firestore's optimistic-concurrency retry) and fail cleanly instead of
 * restoring seats twice.
 */
export async function cancelBookingForUser(uid: string, callerIsAdmin: boolean, opts: CancelOptions) {
  if (!opts.bookingId) throw new HttpError('invalid-argument', 'Missing bookingId.');
  const db = getAdminDb();
  const bookingRef = db.collection('bookings').doc(opts.bookingId);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(bookingRef);
      if (!snap.exists) throw new HttpError('not-found', 'This booking no longer exists.');
      const booking = snap.data()!;

      if (booking.userId !== uid && !callerIsAdmin) {
        throw new HttpError('permission-denied', 'You can only cancel your own bookings.');
      }
      if (booking.status === 'cancelled') {
        throw new HttpError('failed-precondition', 'This booking is already cancelled.');
      }

      const now = Date.now();
      const patch: Record<string, unknown> = { status: 'cancelled', cancellationReason: opts.reason || null, updatedAt: now };
      if (opts.paymentStatus) patch.paymentStatus = opts.paymentStatus;
      tx.update(bookingRef, patch);

      // Seat restoration only applies to flights being cancelled from a genuinely
      // confirmed state — a 'completed' (already-flown) booking isn't reversed.
      if (booking.bookingType === 'flight' && booking.status === 'confirmed') {
        const details = booking.details as FlightBookingDetails;
        const passengerCount = booking.guests as number;
        const cabin = details.cabin;

        const outboundRef = db.collection('flights').doc(details.outboundFlightId);
        tx.update(outboundRef, { [`fares.${cabin}.seatsAvailable`]: FieldValue.increment(passengerCount), updatedAt: now });

        if (details.returnFlightId) {
          const returnRef = db.collection('flights').doc(details.returnFlightId);
          tx.update(returnRef, { [`fares.${cabin}.seatsAvailable`]: FieldValue.increment(passengerCount), updatedAt: now });
        }
      }

      tx.set(db.collection('notifications').doc(), {
        userId: booking.userId,
        title: 'Booking cancelled',
        message: `Your ${booking.bookingType} booking (${booking.bookingReference}) has been cancelled.`,
        type: 'booking_cancelled',
        read: false,
        relatedBookingId: bookingRef.id,
        createdAt: now,
      });
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('cancelBooking failed', error);
    throw new HttpError('internal', 'We couldn’t cancel this booking. Please try again.');
  }
}

export async function createBookingForUser(uid: string, data: CreateBookingRequest) {
  if (!data || !data.bookingType || !data.itemId || !data.customerInfo || !data.details) {
    throw new HttpError('invalid-argument', 'Missing required booking information.');
  }
  if (!data.customerInfo.email || !data.customerInfo.firstName || !data.customerInfo.lastName) {
    throw new HttpError('invalid-argument', 'Customer contact details are incomplete.');
  }
  if (typeof data.startDate !== 'number' || typeof data.endDate !== 'number') {
    throw new HttpError('invalid-argument', 'Missing booking dates.');
  }

  const db = getAdminDb();

  let couponSnap: CouponSnap | null = null;
  if (data.couponCode) {
    const couponQuery = await db.collection('coupons').where('code', '==', data.couponCode.trim().toUpperCase()).limit(1).get();
    couponSnap = couponQuery.empty ? null : couponQuery.docs[0]!;
  }

  try {
    return await db.runTransaction(async (tx) => {
      switch (data.bookingType) {
        case 'flight':
          return bookFlight(tx, db, uid, data, couponSnap);
        case 'hotel':
          return bookHotel(tx, db, uid, data, couponSnap);
        case 'car':
          return bookCar(tx, db, uid, data, couponSnap);
        case 'transfer':
          return bookTransfer(tx, db, uid, data, couponSnap);
        default:
          throw new HttpError('invalid-argument', 'Unknown booking type.');
      }
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('createBooking failed', error);
    throw new HttpError('internal', 'We couldn’t complete your booking. Please try again.');
  }
}
