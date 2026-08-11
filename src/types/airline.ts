export interface Airline {
  id: string;
  code: string;
  name: string;
  logoUrl: string | null;
  /** Cloudinary public_id for `logoUrl` — needed to delete/replace it. Optional: absent on pre-Cloudinary documents. */
  logoPublicId?: string | null;
  country: string;
  createdAt: number;
  updatedAt: number;
}

export type AirlineInput = Omit<Airline, 'id' | 'createdAt' | 'updatedAt'>;
