import { getAdminAuth, getAdminDb } from './firebaseAdmin';
import { HttpError } from './httpError';

export interface AuthedUser {
  uid: string;
  email: string | null;
}

/** Verifies the `Authorization: Bearer <idToken>` header against Firebase Auth. Throws unauthenticated on any failure. */
export async function requireAuth(req: Request): Promise<AuthedUser> {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
  const match = header?.match(/^Bearer (.+)$/);
  if (!match) throw new HttpError('unauthenticated', 'You must be signed in to do that.');

  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1]!);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    throw new HttpError('unauthenticated', 'Your session has expired. Please sign in again.');
  }
}

/** Mirrors firestore.rules' isAdmin(): true only if the caller's own user doc has role === 'admin'. */
export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getAdminDb().collection('users').doc(uid).get();
  return snap.exists && snap.data()?.role === 'admin';
}
