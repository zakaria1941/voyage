import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CarSupplier, CarSupplierInput } from '@/types/car';
import { mapDoc, mapDocs } from './firestoreUtils';

const suppliersCol = () => collection(db, 'carSuppliers');

let cache: CarSupplier[] | null = null;

export async function listCarSuppliers(): Promise<CarSupplier[]> {
  if (cache) return cache;
  const snap = await getDocs(query(suppliersCol(), orderBy('name')));
  cache = mapDocs<CarSupplier>(snap);
  return cache;
}

export function invalidateCarSupplierCache(): void {
  cache = null;
}

export async function getCarSupplier(id: string): Promise<CarSupplier | null> {
  const snap = await getDoc(doc(db, 'carSuppliers', id));
  return snap.exists() ? mapDoc<CarSupplier>(snap) : null;
}

export async function createCarSupplier(input: CarSupplierInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(suppliersCol(), { ...input, createdAt: now, updatedAt: now });
  invalidateCarSupplierCache();
  return ref.id;
}

export async function updateCarSupplier(id: string, input: Partial<CarSupplierInput>): Promise<void> {
  await updateDoc(doc(db, 'carSuppliers', id), { ...input, updatedAt: Date.now() });
  invalidateCarSupplierCache();
}

export async function deleteCarSupplier(id: string): Promise<void> {
  await deleteDoc(doc(db, 'carSuppliers', id));
  invalidateCarSupplierCache();
}
