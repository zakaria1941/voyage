import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transfer, TransferInput } from '@/types/transfer';
import { mapDoc, mapDocs } from './firestoreUtils';

const transfersCol = () => collection(db, 'transfers');

export interface TransferSearchQuery {
  /** Pickup airport code, e.g. "CDG". Omit or pass an empty string to match any pickup airport. */
  airport?: string;
  /**
   * Free-text drop-off (city, address, or airport name/code). Transfers
   * don't store a separate "dropoff" field — a transfer's `city` is the
   * city its airport serves, which is what a drop-off address is really
   * asking about, so this matches against `city`/`airportName`/`airportCode`.
   * Case-insensitive substring match, applied client-side (see searchCars
   * for why: no native Firestore substring/OR-field query).
   */
  destination?: string;
}

/** Empty/omitted `airport` returns every transfer rather than nothing — browsing without a specific airport is a valid search. */
export async function searchTransfers({ airport, destination }: TransferSearchQuery): Promise<Transfer[]> {
  const code = airport?.trim().toUpperCase();
  const snap = code
    ? await getDocs(query(transfersCol(), where('airportCode', '==', code), orderBy('pricePerTrip')))
    : await getDocs(query(transfersCol(), orderBy('pricePerTrip')));
  const results = mapDocs<Transfer>(snap);

  const dest = destination?.trim().toLowerCase();
  if (!dest) return results;
  return results.filter(
    (t) => t.city.toLowerCase().includes(dest) || t.airportName.toLowerCase().includes(dest) || t.airportCode.toLowerCase() === dest,
  );
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
