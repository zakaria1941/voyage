import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlatformSettings } from '@/types/settings';

const GENERAL_SETTINGS_ID = 'general';

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  const snap = await getDoc(doc(db, 'settings', GENERAL_SETTINGS_ID));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PlatformSettings) : null;
}

export async function updatePlatformSettings(input: Omit<PlatformSettings, 'id' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'settings', GENERAL_SETTINGS_ID), { ...input, updatedAt: Date.now() });
}
