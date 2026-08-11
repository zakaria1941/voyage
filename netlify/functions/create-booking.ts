import type { Context } from '@netlify/functions';
import { requireAuth } from '../lib/requestAuth';
import { createBookingForUser } from '../lib/booking';
import { jsonResponse, preflightResponse, withErrorHandling, HttpError } from '../lib/httpError';
import type { CreateBookingRequest } from '../lib/bookingTypes';

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'POST') return jsonResponse({ code: 'invalid-argument', message: 'Method not allowed.' }, 405);

  return withErrorHandling(async () => {
    const { uid } = await requireAuth(req);

    let body: CreateBookingRequest;
    try {
      body = (await req.json()) as CreateBookingRequest;
    } catch {
      throw new HttpError('invalid-argument', 'Request body must be valid JSON.');
    }

    const result = await createBookingForUser(uid, body);
    return jsonResponse(result, 200);
  });
};
