import type { CarCategory } from './search';
import type { Transmission, FuelType } from './car';

export interface CarFiltersState {
  maxPrice: number | null;
  categories: CarCategory[];
  transmission: Transmission | 'any';
  minSeats: number;
  fuelTypes: FuelType[];
  suppliers: string[];
}

export const DEFAULT_CAR_FILTERS: CarFiltersState = {
  maxPrice: null,
  categories: [],
  transmission: 'any',
  minSeats: 0,
  fuelTypes: [],
  suppliers: [],
};
