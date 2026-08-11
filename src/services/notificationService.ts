import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/types/notification';
import { mapDocs } from './firestoreUtils';

const notificationsCol = () => collection(db, 'notifications');

export async function listNotifications(userId: string, max = 30): Promise<Notification[]> {
  const snap = await getDocs(
    query(notificationsCol(), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(max)),
  );
  return mapDocs<Notification>(snap);
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const snap = await getDocs(query(notificationsCol(), where('userId', '==', userId), where('read', '==', false)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}
