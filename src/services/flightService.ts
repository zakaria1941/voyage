import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Flight, FlightInput } from '@/types/flight';
import { mapDoc, mapDocs } from './firestoreUtils';

const flightsCol = () => collection(db, 'flights');

export interface FlightSearchQuery {
  /** Airport/city code. Omit or pass an empty string to match any origin. */
  origin?: string;
  /** Airport/city code. Omit or pass an empty string to match any destination. */
  destination?: string;
}

/**
 * Route matching is forgiving by design: origin and destination are each
 * independently optional, so "From only", "To only", and "neither" all
 * return real results instead of an empty page. The departure date is
 * deliberately NOT part of this query — with a small seeded dataset,
 * requiring an exact date match hides real inventory for no reason. Callers
 * (FlightResultsPage) treat the date as a soft, client-side filter with a
 * fallback to the full route when no flights land on the exact day.
 */
export async function searchFlights({ origin, destination }: FlightSearchQuery): Promise<Flight[]> {
  const constraints: QueryConstraint[] = [];
  if (origin?.trim()) constraints.push(where('originCode', '==', origin.trim().toUpperCase()));
  if (destination?.trim()) constraints.push(where('destinationCode', '==', destination.trim().toUpperCase()));
  constraints.push(orderBy('departureTime'));

  const snap = await getDocs(query(flightsCol(), ...constraints));
  return mapDocs<Flight>(snap);
}

export async function listFlights(max = 50): Promise<Flight[]> {
  const snap = await getDocs(query(flightsCol(), orderBy('departureTime', 'desc')));
  return mapDocs<Flight>(snap).slice(0, max);
}

export async function getFlight(id: string): Promise<Flight | null> {
  const snap = await getDoc(doc(db, 'flights', id));
  return snap.exists() ? mapDoc<Flight>(snap) : null;
}

export async function createFlight(input: FlightInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(flightsCol(), { ...input, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateFlight(id: string, input: Partial<FlightInput>): Promise<void> {
  await updateDoc(doc(db, 'flights', id), { ...input, updatedAt: Date.now() });
}

export async function deleteFlight(id: string): Promise<void> {
  await deleteDoc(doc(db, 'flights', id));
}
