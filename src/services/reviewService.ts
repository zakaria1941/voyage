import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BookingType } from '@/types/common';
import type { Review, ReviewInput } from '@/types/review';
import { mapDoc, mapDocs } from './firestoreUtils';

const reviewsCol = () => collection(db, 'reviews');

export async function listReviewsForItem(itemType: BookingType, itemId: string): Promise<Review[]> {
  const snap = await getDocs(
    query(reviewsCol(), where('itemType', '==', itemType), where('itemId', '==', itemId), orderBy('createdAt', 'desc')),
  );
  return mapDocs<Review>(snap);
}

export async function getReviewForBooking(bookingId: string): Promise<Review | null> {
  const snap = await getDoc(doc(db, 'reviews', bookingId));
  return snap.exists() ? mapDoc<Review>(snap) : null;
}

/**
 * Uses the source booking's id as the review document id. This turns
 * "one review per booking" into a rule the security rules can enforce for
 * free: a duplicate submission becomes an update on an existing document,
 * which the ruleset only allows for admins — see firestore.rules.
 */
export async function createReview(bookingId: string, input: ReviewInput): Promise<void> {
  await setDoc(doc(db, 'reviews', bookingId), {
    ...input,
    bookingId,
    createdAt: Date.now(),
  });
}

export async function listAllReviews(max = 100): Promise<Review[]> {
  const snap = await getDocs(query(reviewsCol(), orderBy('createdAt', 'desc')));
  return mapDocs<Review>(snap).slice(0, max);
}
