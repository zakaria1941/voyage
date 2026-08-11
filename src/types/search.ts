export type TripType = 'roundtrip' | 'oneway' | 'multicity';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  premium_economy: 'Premium Economy',
  business: 'Business',
  first: 'First',
};

export interface FlightSearchParams {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

export type CarCategory = 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'van' | 'electric';

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  sameDropoff: boolean;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
}

export type TransferVehicleType = 'standard' | 'business' | 'van' | 'luxury';

export interface TransferSearchParams {
  airport: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  vehicleType: TransferVehicleType | 'any';
}
