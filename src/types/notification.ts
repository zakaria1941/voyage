export type NotificationType = 'booking_confirmed' | 'booking_cancelled' | 'reminder' | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedBookingId: string | null;
  createdAt: number;
}
