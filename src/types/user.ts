import type { UserRole } from './common';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  photoURL: string | null;
  /** Cloudinary public_id for `photoURL` — needed to delete/replace it. Optional: absent on pre-Cloudinary documents. */
  photoPublicId?: string | null;
  country: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UpdatableProfileFields {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  country?: string | null;
  photoURL?: string | null;
  photoPublicId?: string | null;
}
