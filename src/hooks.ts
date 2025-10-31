import { useEffect, useRef, useState, useCallback } from "react";

type UseAsyncOptions<T> = {
  /** Optional initial data shown before first load */
  initialData?: T;
  /** Run immediately on mount (default: true) */
  immediate?: boolean;
};

type UseAsyncState<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  /** Manually trigger the async function */
  refetch: () => Promise<void>;
  /** Set data directly (useful after user actions) */
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
};

/**
 * useAsync — small, reliable async hook with:
 * - loading + error states
 * - unmount safety
 * - manual refetch()
 * - optional initialData
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: any[] = [],
  options: UseAsyncOptions<T> = {}
): UseAsyncState<T> {
  const { initialData, immediate = true } = options;
  const [data, setDataState] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | undefined>(undefined);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSet = useCallback(<K extends keyof UseAsyncState<T>>(
    setter: (s: { data: T | undefined; loading: boolean; error: string | undefined }) => void
  ) => {
    if (mountedRef.current) {
      setter({ data, loading, error });
    }
  }, [data, loading, error]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await fn();
      if (!mountedRef.current) return;
      setDataState(result);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message ?? "Something went wrong");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(async () => {
    await run();
  }, [run]);

  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState(prev => (typeof updater === "function" ? (updater as any)(prev) : updater));
  }, []);

  return { data, loading, error, refetch, setData };
}
