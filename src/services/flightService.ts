import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Flight, FlightInput } from '@/types/flight';
import { dayRangeMillis, mapDoc, mapDocs } from './firestoreUtils';

const flightsCol = () => collection(db, 'flights');

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
}

/**
 * Narrows via an indexed equality+range query (origin, destination, date
 * range — see firestore.indexes.json), then leaves sort/secondary filtering
 * (stops, airline, time-of-day, cabin) to the UI layer, since a single
 * route/day in this demo dataset returns only a handful of documents.
 */
export async function searchFlights({ origin, destination, departureDate }: FlightSearchQuery): Promise<Flight[]> {
  const { start, end } = dayRangeMillis(departureDate);
  const snap = await getDocs(
    query(
      flightsCol(),
      where('originCode', '==', origin.toUpperCase()),
      where('destinationCode', '==', destination.toUpperCase()),
      where('departureTime', '>=', start),
      where('departureTime', '<=', end),
      orderBy('departureTime'),
    ),
  );
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
