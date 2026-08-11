/**
 * Error handling for Netlify Function HTTP handlers, filling the role
 * `firebase-functions`'s `HttpsError` used to play for callables: a small
 * set of well-known codes, a user-safe message, and a matching HTTP status.
 * The client (src/utils/errors.ts) matches on `code` the same way it used
 * to match on the `functions/*` prefix from callable errors.
 */
const STATUS_BY_CODE: Record<string, number> = {
  'invalid-argument': 400,
  unauthenticated: 401,
  'permission-denied': 403,
  'not-found': 404,
  'failed-precondition': 409,
  internal: 500,
};

export class HttpError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: keyof typeof STATUS_BY_CODE, message: string) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.status = STATUS_BY_CODE[code] ?? 500;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function preflightResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Wraps a handler body so any HttpError (or unexpected error) becomes a well-formed JSON error response. */
export async function withErrorHandling(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ code: error.code, message: error.message }, error.status);
    }
    console.error('[netlify function] unhandled error', error);
    return jsonResponse({ code: 'internal', message: 'Something went wrong. Please try again.' }, 500);
  }
}
