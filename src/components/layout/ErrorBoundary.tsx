import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logError } from '@/utils/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level safety net (spec section 38: centralized error handling). Only a
 * class component can catch render errors — there is no hook equivalent.
 * Anything caught here is an unexpected bug, not a normal API/network
 * failure (those are handled per-page via useAsync + ErrorState).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
            <AlertTriangle className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-ink-500">
            We hit an unexpected error. Please try reloading the page — if it keeps happening, contact support.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
