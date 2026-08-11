import type { CreateBookingRequest } from './booking';
import type { Pricing } from './common';

/**
 * Passed via router state from a details page to the checkout page. Carries
 * the not-yet-submitted booking request plus display-only fields for the
 * checkout summary. `previewPricing` is computed client-side with the same
 * pricing engine the server uses, purely so the user sees a total before
 * confirming — the Cloud Function recomputes it authoritatively at booking
 * time and that server figure is what's actually stored/charged.
 */
export interface DraftBooking extends CreateBookingRequest {
  previewPricing: Pricing;
  displayLabel: string;
  displaySubLabel?: string;
}
