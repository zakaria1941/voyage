import { useEffect, useState, type DependencyList } from 'react';
import type { AsyncState } from '@/types/common';
import { getFriendlyErrorMessage } from '@/utils/errors';

/**
 * Runs `fn` whenever `deps` changes and exposes {data, loading, error}.
 * `fn` is intentionally excluded from the effect's dependency check — pass
 * an inline function and list its real inputs in `deps`, same as useMemo.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Resetting to a loading state when the query changes is React's own
    // documented pattern for data-fetching effects (see "Fetching data"
    // in the Effects docs) — the stricter set-state-in-effect lint rule
    // flags it anyway, so it's suppressed deliberately here rather than
    // contorted into a ref-read-during-render, which is an actual bug.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null });
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: getFriendlyErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
}
