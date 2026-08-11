import { collection, doc, getCountFromServer, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { UserProfile, UpdatableProfileFields } from '@/types/user';
import type { UserRole } from '@/types/common';
import { mapDocs } from './firestoreUtils';

const usersCol = () => 'users';

export function userDocRef(uid: string) {
  return doc(db, usersCol(), uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Creates the Firestore users/{uid} profile document the first time a
 * Firebase Auth user is seen (fresh sign-up, or first sign-in via a
 * federated provider like Google that never called register()).
 */
export async function ensureUserProfile(firebaseUser: User, extra?: Partial<UserProfile>): Promise<UserProfile> {
  const existing = await getUserProfile(firebaseUser.uid);
  if (existing) return existing;

  const [firstName, ...rest] = (firebaseUser.displayName ?? '').split(' ').filter(Boolean);
  const now = Date.now();

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    firstName: extra?.firstName ?? firstName ?? 'Traveler',
    lastName: extra?.lastName ?? (rest.length ? rest.join(' ') : ''),
    email: firebaseUser.email ?? '',
    phone: extra?.phone ?? firebaseUser.phoneNumber ?? null,
    photoURL: extra?.photoURL ?? firebaseUser.photoURL ?? null,
    country: extra?.country ?? null,
    role: 'user',
    emailVerified: firebaseUser.emailVerified,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userDocRef(firebaseUser.uid), profile);
  return profile;
}

export async function updateUserProfile(uid: string, fields: UpdatableProfileFields): Promise<void> {
  await updateDoc(userDocRef(uid), {
    ...fields,
    updatedAt: Date.now(),
  });
}

export async function syncEmailVerified(uid: string, emailVerified: boolean): Promise<void> {
  await updateDoc(userDocRef(uid), { emailVerified, updatedAt: Date.now() });
}

export async function getUserCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, usersCol()));
  return snap.data().count;
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, usersCol()), orderBy('createdAt', 'desc')));
  return mapDocs<UserProfile>(snap);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(userDocRef(uid), { role, updatedAt: Date.now() });
}
