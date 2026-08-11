import type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

export function mapDoc<T>(snap: DocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T;
}

export function mapDocs<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => mapDoc<T>(d));
}

/** Start-of-day / end-of-day epoch millis for a `yyyy-MM-dd` string, used for same-day range queries. */
export function dayRangeMillis(isoDate: string): { start: number; end: number } {
  const start = new Date(`${isoDate}T00:00:00`).getTime();
  const end = new Date(`${isoDate}T23:59:59.999`).getTime();
  return { start, end };
}
