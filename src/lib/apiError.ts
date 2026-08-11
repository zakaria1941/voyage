/** Error shape returned by our Netlify Functions (see netlify/lib/httpError.ts on the server side). */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
