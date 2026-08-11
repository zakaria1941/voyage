import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Car, CarInput } from '@/types/car';
import { mapDoc, mapDocs } from './firestoreUtils';

const carsCol = () => collection(db, 'cars');

export interface CarSearchQuery {
  pickupLocation: string;
  sort?: 'price' | 'seats';
}

export async function searchCars({ pickupLocation, sort = 'price' }: CarSearchQuery): Promise<Car[]> {
  const citySearch = pickupLocation.trim().toLowerCase();
  if (!citySearch) return [];
  const field = sort === 'seats' ? 'seats' : 'pricePerDay';
  const snap = await getDocs(query(carsCol(), where('pickupCitySearch', '==', citySearch), orderBy(field)));
  return mapDocs<Car>(snap);
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
