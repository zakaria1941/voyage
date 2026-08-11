import type { BookingStatus, BookingType, Pricing } from './common';
import type { CabinClass, TripType } from './search';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface FlightPassenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
}

export interface FlightBookingDetails {
  tripType: TripType;
  cabin: CabinClass;
  outboundFlightId: string;
  returnFlightId: string | null;
  passengers: FlightPassenger[];
}

export interface HotelBookingDetails {
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  checkIn: number;
  checkOut: number;
  nights: number;
  rooms: number;
  primaryGuestName: string;
}

export interface CarBookingDetails {
  carId: string;
  carName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupAt: number;
  dropoffAt: number;
  driverAge: number;
  driverName: string;
}

export interface TransferBookingDetails {
  transferId: string;
  vehicleName: string;
  pickupAddress: string;
  dropoffAddress: string;
  flightNumber: string | null;
  passengers: number;
  luggage: number;
  childSeatRequired: boolean;
}

export type BookingDetails = FlightBookingDetails | HotelBookingDetails | CarBookingDetails | TransferBookingDetails;

export interface Booking {
  id: string;
  userId: string;
  bookingType: BookingType;
  itemId: string;
  status: BookingStatus;
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
  startDate: number;
  endDate: number;
  guests: number;
  customerInfo: CustomerInfo;
  details: BookingDetails;
  pricing: Pricing;
  couponCode: string | null;
  bookingReference: string;
  specialRequests: string | null;
  cancellationReason: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Input shape sent to the `createBooking` callable. The server always
 * computes and stores pricing in EUR (see utils/pricing.ts) — there is no
 * `currency` field here, because the request never carries a chargeable
 * amount; only the selected *display* currency (a pure render-time concern
 * via useCurrency()) varies per user.
 */
export interface CreateBookingRequest {
  bookingType: BookingType;
  itemId: string;
  startDate: number;
  endDate: number;
  guests: number;
  customerInfo: CustomerInfo;
  details: BookingDetails;
  couponCode?: string;
  specialRequests?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  bookingReference: string;
  pricing: Pricing;
}
