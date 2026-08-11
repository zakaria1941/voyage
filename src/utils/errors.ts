import { FirebaseError } from 'firebase/app';
import { ApiError } from '@/lib/apiError';

/**
 * Maps internal/Firebase errors to short, friendly, user-safe messages.
 * Full technical detail is always logged to the console for developers,
 * never shown to the user (spec section 38: centralized error handling).
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/user-not-found': 'We couldn’t find an account with those details.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
};

export function getFriendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  // Errors from our Netlify Functions (netlify/lib/httpError.ts) carry the exact
  // message the backend's HttpError was thrown with, which is already written
  // to be user-safe — show it directly instead of masking it with the fallback.
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof FirebaseError) {
    const mapped = AUTH_ERROR_MESSAGES[error.code];
    if (mapped) return mapped;

    if (error.code.startsWith('firestore/permission-denied') || error.code === 'permission-denied') {
      return 'You don’t have permission to do that.';
    }
    if (error.code === 'unavailable') {
      return 'We’re having trouble connecting right now. Please try again shortly.';
    }

    logError(error);
    return fallback;
  }

  if (error instanceof Error) {
    logError(error);
    return fallback;
  }

  logError(error);
  return fallback;
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  // Centralized developer-facing logging. In production this is where
  // an error-reporting service (Sentry, etc.) would be wired in.
  console.error('[voyago:error]', error, context ?? '');
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string = 'Something went wrong. Please try again.',
  ) {
    super(message);
    this.name = 'AppError';
  }
}
