/**
 * Cloudinary configuration + authorization for Netlify Functions.
 * The API secret lives ONLY here (server-side) — it must never reach the
 * browser. Uploads are signed (not unsigned presets) so every upload is
 * authenticated and scoped to a folder the caller is actually allowed to
 * write to, mirroring the same ownership/admin checks firestore.rules uses.
 */
import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from './httpError';

let configured = false;
export function getCloudinary(): typeof cloudinary {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (Netlify environment variables — see .env.example).',
      );
    }
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }
  return cloudinary;
}

export const IMAGE_ROOT = 'voyago';

/** Every folder/public_id we hand out or accept lives under voyago/<scope>/... */
export function buildFolder(scope: string, id: string): string {
  return `${IMAGE_ROOT}/${scope}/${id}`;
}

const ADMIN_ONLY_SCOPES = ['hotels', 'cars', 'transfers', 'airlines', 'suppliers'];

/**
 * Mirrors firestore.rules' ownership model for storage-equivalent checks:
 *  - voyago/users/{uid}/... may only be written by that same uid.
 *  - every other top-level scope (inventory images/logos) is admin-only.
 * Applied identically to upload folders and to delete target public_ids,
 * since a Cloudinary public_id is just "<folder>/<generated-id>".
 */
export function assertCanManage(folderOrPublicId: string, caller: { uid: string; isAdmin: boolean }): void {
  const parts = folderOrPublicId.split('/');
  if (parts[0] !== IMAGE_ROOT || parts.length < 2) {
    throw new HttpError('invalid-argument', 'Invalid image folder.');
  }
  const scope = parts[1];

  if (scope === 'users') {
    const ownerUid = parts[2];
    if (ownerUid !== caller.uid) {
      throw new HttpError('permission-denied', 'You can only manage your own images.');
    }
    return;
  }

  if (ADMIN_ONLY_SCOPES.includes(scope ?? '')) {
    if (!caller.isAdmin) {
      throw new HttpError('permission-denied', 'Only admins can manage this image.');
    }
    return;
  }

  throw new HttpError('invalid-argument', 'Unknown image scope.');
}
