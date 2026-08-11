import type { CarCategory } from './search';

export type Transmission = 'automatic' | 'manual';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';

export const CAR_FEATURES = [
  'air_conditioning',
  'bluetooth',
  'gps',
  'child_seat_available',
  'usb_charger',
  'cruise_control',
  'parking_sensors',
  'roof_rack',
] as const;
export type CarFeature = (typeof CAR_FEATURES)[number];

export interface CarSupplier {
  id: string;
  name: string;
  logoUrl: string | null;
  /** Cloudinary public_id for `logoUrl` — needed to delete/replace it. Optional: absent on pre-Cloudinary documents. */
  logoPublicId?: string | null;
  rating: number;
  createdAt: number;
  updatedAt: number;
}

export type CarSupplierInput = Omit<CarSupplier, 'id' | 'createdAt' | 'updatedAt'>;

export interface Car {
  id: string;
  supplierId: string;
  supplierName: string;
  make: string;
  model: string;
  category: CarCategory;
  transmission: Transmission;
  seats: number;
  doors: number;
  fuelType: FuelType;
  mileagePolicy: string;
  images: string[];
  /** Cloudinary public_ids, index-aligned with `images` — needed to delete images. Optional: absent on pre-Cloudinary documents. */
  imagePublicIds?: string[];
  pickupCity: string;
  /** Lowercase copy of `pickupCity`, used for case-insensitive equality queries. */
  pickupCitySearch: string;
  pickupLocation: string;
  features: CarFeature[];
  pricePerDay: number;
  depositAmount: number;
  minDriverAge: number;
  totalUnits: number;
  createdAt: number;
  updatedAt: number;
}

// pickupCitySearch is derived server-side (from `pickupCity`) by carService, not supplied by callers.
export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'pickupCitySearch'>;
