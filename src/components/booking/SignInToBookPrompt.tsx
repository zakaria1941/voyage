import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export function SignInToBookPrompt() {
  const location = useLocation();

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center">
      <h3 className="font-display text-lg font-semibold text-ink-950">Sign in to complete your booking</h3>
      <p className="mt-1.5 text-sm text-ink-600">Create a free account or log in — your selection will be waiting for you.</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          state={{ from: location }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <LogIn className="size-4" />
          Log in
        </Link>
        <Link
          to="/register"
          state={{ from: location }}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          <UserPlus className="size-4" />
          Create account
        </Link>
      </div>
    </div>
  );
}
