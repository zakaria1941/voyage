export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  updatedAt: number;
}

export type AirportInput = Omit<Airport, 'id' | 'createdAt' | 'updatedAt'>;
