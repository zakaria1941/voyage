import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BookingType } from '@/types/common';
import type { Favorite } from '@/types/favorite';
import { mapDocs } from './firestoreUtils';

const favoritesCol = (userId: string) => collection(db, 'users', userId, 'favorites');

function favoriteId(itemType: BookingType, itemId: string): string {
  return `${itemType}_${itemId}`;
}

export async function listFavorites(userId: string): Promise<Favorite[]> {
  const snap = await getDocs(query(favoritesCol(userId), orderBy('createdAt', 'desc')));
  return mapDocs<Favorite>(snap);
}

export async function isFavorite(userId: string, itemType: BookingType, itemId: string): Promise<boolean> {
  const snap = await getDoc(doc(favoritesCol(userId), favoriteId(itemType, itemId)));
  return snap.exists();
}

export async function addFavorite(userId: string, itemType: BookingType, itemId: string): Promise<void> {
  await setDoc(doc(favoritesCol(userId), favoriteId(itemType, itemId)), {
    itemType,
    itemId,
    createdAt: Date.now(),
  });
}

export async function removeFavorite(userId: string, itemType: BookingType, itemId: string): Promise<void> {
  await deleteDoc(doc(favoritesCol(userId), favoriteId(itemType, itemId)));
}
