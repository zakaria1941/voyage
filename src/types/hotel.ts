export type PropertyType = 'hotel' | 'apartment' | 'resort' | 'villa' | 'hostel';

export const HOTEL_AMENITIES = [
  'wifi',
  'pool',
  'parking',
  'breakfast',
  'gym',
  'spa',
  'air_conditioning',
  'airport_shuttle',
  'restaurant',
  'bar',
  'pet_friendly',
  'family_rooms',
  'front_desk_24h',
] as const;
export type HotelAmenity = (typeof HOTEL_AMENITIES)[number];

export interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  /** Lowercase copy of `city`, used for case-insensitive equality queries. */
  citySearch: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  propertyType: PropertyType;
  amenities: HotelAmenity[];
  images: string[];
  /** Cloudinary public_ids, index-aligned with `images` — needed to delete images. Optional: absent on pre-Cloudinary documents. */
  imagePublicIds?: string[];
  pricePerNight: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  createdAt: number;
  updatedAt: number;
}

// citySearch is derived server-side (from `city`) by hotelService, not supplied by callers.
export type HotelInput = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt' | 'reviewScore' | 'reviewCount' | 'citySearch'>;

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxGuests: number;
  bedType: string;
  sizeSqm: number;
  images: string[];
  /** Cloudinary public_ids, index-aligned with `images` — needed to delete images. Optional: absent on pre-Cloudinary documents. */
  imagePublicIds?: string[];
  amenities: HotelAmenity[];
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  pricePerNight: number;
  totalUnits: number;
  createdAt: number;
  updatedAt: number;
}

export type RoomInput = Omit<Room, 'id' | 'hotelId' | 'createdAt' | 'updatedAt'>;
