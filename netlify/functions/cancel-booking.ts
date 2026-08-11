import type { Context } from '@netlify/functions';
import { requireAuth, isAdmin } from '../lib/requestAuth';
import { cancelBookingForUser } from '../lib/booking';
import { jsonResponse, preflightResponse, withErrorHandling, HttpError } from '../lib/httpError';

interface CancelBookingRequest {
  bookingId: string;
  reason?: string;
  paymentStatus?: string;
}

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'POST') return jsonResponse({ code: 'invalid-argument', message: 'Method not allowed.' }, 405);

  return withErrorHandling(async () => {
    const { uid } = await requireAuth(req);
    const admin = await isAdmin(uid);

    let body: CancelBookingRequest;
    try {
      body = (await req.json()) as CancelBookingRequest;
    } catch {
      throw new HttpError('invalid-argument', 'Request body must be valid JSON.');
    }

    // Only an admin caller may set paymentStatus (matches the pre-existing admin-only broader transition).
    const paymentStatus = admin ? body.paymentStatus : undefined;

    await cancelBookingForUser(uid, admin, { bookingId: body.bookingId, reason: body.reason, paymentStatus });
    return jsonResponse({ success: true });
  });
};
