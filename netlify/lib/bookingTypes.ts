export type BookingType = 'flight' | 'hotel' | 'car' | 'transfer';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

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
  tripType: 'roundtrip' | 'oneway' | 'multicity';
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
