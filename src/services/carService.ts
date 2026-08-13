import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Car, CarInput } from '@/types/car';
import { mapDoc, mapDocs } from './firestoreUtils';

const carsCol = () => collection(db, 'cars');

export interface CarSearchQuery {
  /**
   * Free text: a pickup city ("Paris"), or car info (make/model/category,
   * e.g. "Toyota", "SUV"). Case-insensitive, matches partial words. Omit or
   * pass an empty string to return the full public catalog.
   */
  pickupLocation?: string;
  sort?: 'price' | 'seats';
}

/**
 * Two-tier lookup: first tries an indexed exact-city match (the common,
 * fast case). If that finds nothing — because the term isn't a city at all,
 * e.g. "Toyota" or "SUV", or is a partial word like "toy" — falls back to
 * fetching the catalog and matching the term against city/make/model/
 * category client-side. Firestore has no native substring/OR-across-fields
 * query, and at this catalog's real-world size (dozens of cars, not
 * millions) filtering the already-fetched list in memory is simpler and
 * more correct than trying to force it through `where()` clauses.
 */
export async function searchCars({ pickupLocation, sort = 'price' }: CarSearchQuery): Promise<Car[]> {
  const field = sort === 'seats' ? 'seats' : 'pricePerDay';
  const term = pickupLocation?.trim().toLowerCase();

  if (!term) {
    const snap = await getDocs(query(carsCol(), orderBy(field)));
    return mapDocs<Car>(snap);
  }

  const citySnap = await getDocs(query(carsCol(), where('pickupCitySearch', '==', term), orderBy(field)));
  const cityMatches = mapDocs<Car>(citySnap);
  if (cityMatches.length > 0) return cityMatches;

  const allSnap = await getDocs(query(carsCol(), orderBy(field)));
  return mapDocs<Car>(allSnap).filter(
    (c) =>
      c.pickupCity.toLowerCase().includes(term) ||
      c.make.toLowerCase().includes(term) ||
      c.model.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term),
  );
}

export async function listCars(max = 100): Promise<Car[]> {
  const snap = await getDocs(query(carsCol(), orderBy('make')));
  return mapDocs<Car>(snap).slice(0, max);
}

export async function getCar(id: string): Promise<Car | null> {
  const snap = await getDoc(doc(db, 'cars', id));
  return snap.exists() ? mapDoc<Car>(snap) : null;
}

export async function createCar(input: CarInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(carsCol(), {
    ...input,
    pickupCitySearch: input.pickupCity.trim().toLowerCase(),
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateCar(id: string, input: Partial<CarInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...input, updatedAt: Date.now() };
  if (input.pickupCity) patch.pickupCitySearch = input.pickupCity.trim().toLowerCase();
  await updateDoc(doc(db, 'cars', id), patch);
}

export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, 'cars', id));
}
