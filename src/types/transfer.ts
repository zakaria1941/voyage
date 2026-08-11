import type { TransferVehicleType } from './search';

export interface Transfer {
  id: string;
  airportCode: string;
  airportName: string;
  city: string;
  vehicleType: TransferVehicleType;
  vehicleName: string;
  image: string;
  /** Cloudinary public_id for `image` — needed to delete/replace it. Optional: absent on pre-Cloudinary documents. */
  imagePublicId?: string | null;
  maxPassengers: number;
  maxLuggage: number;
  meetAndGreet: boolean;
  freeCancellation: boolean;
  pricePerTrip: number;
  maxDistanceKm: number;
  totalUnits: number;
  createdAt: number;
  updatedAt: number;
}

export type TransferInput = Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>;
