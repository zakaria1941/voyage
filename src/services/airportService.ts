import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Airport, AirportInput } from '@/types/airport';
import { mapDoc, mapDocs } from './firestoreUtils';

const airportsCol = () => collection(db, 'airports');

let cache: Airport[] | null = null;

export async function listAirports(): Promise<Airport[]> {
  if (cache) return cache;
  const snap = await getDocs(query(airportsCol(), orderBy('city')));
  cache = mapDocs<Airport>(snap);
  return cache;
}

export function invalidateAirportCache(): void {
  cache = null;
}

/**
 * Airports are a small (~30 doc) reference dataset with no natural single
 * equality field to search by code/city/name/country at once, so — unlike
 * the larger inventory collections — we fetch the (cached) full list once
 * and filter in memory rather than issuing a new indexed query per keystroke.
 */
export async function searchAirports(term: string, max = 8): Promise<Airport[]> {
  const all = await listAirports();
  const needle = term.trim().toLowerCase();
  if (!needle) return all.slice(0, max);
  return all
    .filter(
      (a) =>
        a.code.toLowerCase().includes(needle) ||
        a.city.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle) ||
        a.country.toLowerCase().includes(needle),
    )
    .slice(0, max);
}

export async function getAirport(id: string): Promise<Airport | null> {
  const snap = await getDoc(doc(db, 'airports', id));
  return snap.exists() ? mapDoc<Airport>(snap) : null;
}

export async function getAirportByCode(code: string): Promise<Airport | null> {
  const snap = await getDocs(query(airportsCol(), where('code', '==', code.toUpperCase()), limit(1)));
  return snap.empty ? null : mapDoc<Airport>(snap.docs[0]);
}

export async function createAirport(input: AirportInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(airportsCol(), { ...input, code: input.code.toUpperCase(), createdAt: now, updatedAt: now });
  invalidateAirportCache();
  return ref.id;
}

export async function updateAirport(id: string, input: Partial<AirportInput>): Promise<void> {
  await updateDoc(doc(db, 'airports', id), { ...input, updatedAt: Date.now() });
  invalidateAirportCache();
}

export async function deleteAirport(id: string): Promise<void> {
  await deleteDoc(doc(db, 'airports', id));
  invalidateAirportCache();
}
