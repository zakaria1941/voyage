import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transfer, TransferInput } from '@/types/transfer';
import { mapDoc, mapDocs } from './firestoreUtils';

const transfersCol = () => collection(db, 'transfers');

export interface TransferSearchQuery {
  airport: string;
}

export async function searchTransfers({ airport }: TransferSearchQuery): Promise<Transfer[]> {
  const code = airport.trim().toUpperCase();
  if (!code) return [];
  const snap = await getDocs(query(transfersCol(), where('airportCode', '==', code), orderBy('pricePerTrip')));
  return mapDocs<Transfer>(snap);
}

export async function listTransfers(max = 100): Promise<Transfer[]> {
  const snap = await getDocs(query(transfersCol(), orderBy('airportCode')));
  return mapDocs<Transfer>(snap).slice(0, max);
}

export async function getTransfer(id: string): Promise<Transfer | null> {
  const snap = await getDoc(doc(db, 'transfers', id));
  return snap.exists() ? mapDoc<Transfer>(snap) : null;
}

export async function createTransfer(input: TransferInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(transfersCol(), { ...input, airportCode: input.airportCode.toUpperCase(), createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateTransfer(id: string, input: Partial<TransferInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...input, updatedAt: Date.now() };
  if (input.airportCode) patch.airportCode = input.airportCode.toUpperCase();
  await updateDoc(doc(db, 'transfers', id), patch);
}

export async function deleteTransfer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'transfers', id));
}
