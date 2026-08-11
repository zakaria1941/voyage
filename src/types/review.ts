import type { BookingType } from './common';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  bookingId: string;
  itemType: BookingType;
  itemId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: number;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt'>;
