import type { PropertyType } from './hotel';

export interface HotelFiltersState {
  maxPrice: number | null;
  minRating: number;
  propertyTypes: PropertyType[];
  breakfastOnly: boolean;
  freeCancellationOnly: boolean;
  amenities: string[];
}

export const DEFAULT_HOTEL_FILTERS: HotelFiltersState = {
  maxPrice: null,
  minRating: 0,
  propertyTypes: [],
  breakfastOnly: false,
  freeCancellationOnly: false,
  amenities: [],
};
