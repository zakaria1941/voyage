/**
 * Firebase Admin SDK bootstrap for Netlify Functions.
 *
 * Production: authenticates with a real service account (three env vars,
 * copied from the downloaded service-account JSON — see .env.example).
 * Local dev: when FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST are
 * set (by `netlify dev`, via a local .env file), the Admin SDK talks to the
 * local emulators instead and only needs a project id — no real credentials.
 *
 * Initialization is lazy (deferred to first use, not run at module import
 * time) so that whatever sets emulator/credential env vars is guaranteed to
 * have already run by the time we actually need them.
 *
 * This file must never be imported by frontend code — it is Node-only and
 * would throw immediately in a browser bundle (no `process.env`).
 *
 * Note: root package.json pins `jwks-rsa` to 3.2.2 via `overrides`.
 * firebase-admin's token verifier requires jwks-rsa, which as of 4.x depends
 * on jose@6 (ESM-only, relying on Node's native require(esm)). That breaks
 * under Netlify's local function runner even though it works in a plain
 * Node process — 3.2.2 is the last version on the CJS-compatible jose@4.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function usingEmulators(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

function buildApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID || 'voyago-demo';

  if (usingEmulators()) {
    return initializeApp({ projectId });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY ' +
        '(Netlify environment variables — see .env.example), or run under `netlify dev` with the Firebase emulators active.',
    );
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

let cachedApp: App | null = null;
function getApp(): App {
  cachedApp ??= buildApp();
  return cachedApp;
}

let cachedAuth: Auth | null = null;
export function getAdminAuth(): Auth {
  cachedAuth ??= getAuth(getApp());
  return cachedAuth;
}

let cachedDb: Firestore | null = null;
export function getAdminDb(): Firestore {
  cachedDb ??= getFirestore(getApp());
  return cachedDb;
}
