import { auth } from './firebase';
import { ApiError } from './apiError';

/**
 * Calls one of our Netlify Functions (netlify/functions/*), attaching the
 * caller's Firebase ID token the same way the old `httpsCallable` did
 * implicitly. Relative URL so it resolves correctly both under `netlify dev`
 * (proxied alongside the Vite app) and on the deployed Netlify site
 * (same-origin) — see README "Local development".
 */
export async function callFunction<TResponse>(name: string, body: unknown): Promise<TResponse> {
  const user = auth.currentUser;
  if (!user) throw new ApiError('unauthenticated', 'You must be signed in to do that.');
  const idToken = await user.getIdToken();

  let res: Response;
  try {
    res = await fetch(`/.netlify/functions/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('unavailable', 'We’re having trouble connecting right now. Please try again shortly.');
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(payload?.code || 'internal', payload?.message || 'Something went wrong. Please try again.');
  }
  return payload as TResponse;
}
