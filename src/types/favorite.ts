import type { BookingType } from './common';

export interface Favorite {
  id: string;
  itemType: BookingType;
  itemId: string;
  createdAt: number;
}
