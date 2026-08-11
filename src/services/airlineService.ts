import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Airline, AirlineInput } from '@/types/airline';
import { mapDoc, mapDocs } from './firestoreUtils';

const airlinesCol = () => collection(db, 'airlines');

let cache: Airline[] | null = null;

export async function listAirlines(): Promise<Airline[]> {
  if (cache) return cache;
  const snap = await getDocs(query(airlinesCol(), orderBy('name')));
  cache = mapDocs<Airline>(snap);
  return cache;
}

export function invalidateAirlineCache(): void {
  cache = null;
}

export async function getAirline(id: string): Promise<Airline | null> {
  const snap = await getDoc(doc(db, 'airlines', id));
  return snap.exists() ? mapDoc<Airline>(snap) : null;
}

export async function createAirline(input: AirlineInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(airlinesCol(), { ...input, code: input.code.toUpperCase(), createdAt: now, updatedAt: now });
  invalidateAirlineCache();
  return ref.id;
}

export async function updateAirline(id: string, input: Partial<AirlineInput>): Promise<void> {
  await updateDoc(doc(db, 'airlines', id), { ...input, updatedAt: Date.now() });
  invalidateAirlineCache();
}

export async function deleteAirline(id: string): Promise<void> {
  await deleteDoc(doc(db, 'airlines', id));
  invalidateAirlineCache();
}
