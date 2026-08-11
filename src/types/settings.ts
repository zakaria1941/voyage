import type { Currency } from './common';

export interface PlatformSettings {
  id: string;
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: Currency;
  maintenanceMode: boolean;
  updatedAt: number;
}
