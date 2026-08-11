import type { CabinClass } from './search';

export interface FlightFare {
  price: number;
  seatsAvailable: number;
}

export type FlightFares = Partial<Record<CabinClass, FlightFare>>;

export type FlightStatus = 'scheduled' | 'delayed' | 'cancelled';

export interface Flight {
  id: string;
  airlineId: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTime: number;
  arrivalTime: number;
  durationMinutes: number;
  stops: number;
  layoverAirportCodes: string[];
  aircraft: string;
  price: number;
  fares: FlightFares;
  baggageChecked: string;
  baggageCabin: string;
  cancellationPolicy: string;
  status: FlightStatus;
  createdAt: number;
  updatedAt: number;
}

export type FlightInput = Omit<Flight, 'id' | 'createdAt' | 'updatedAt'>;
