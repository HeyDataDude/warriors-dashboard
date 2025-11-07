import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

type UseAsyncOptions<T> = {
  initialData?: T;
  immediate?: boolean;
};

type UseAsyncState<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
};

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
  options: UseAsyncOptions<T> = {}
): UseAsyncState<T> {
  const { initialData, immediate = true } = options;

  const [data, setDataState] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(!!immediate);
  const [error, setError] = useState<string | undefined>();

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await fn();
      if (isMounted.current) setDataState(result);
    } catch (err) {
      if (isMounted.current) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    if (immediate) void run();
  }, [run, immediate, ...deps]);

  const refetch = useCallback(() => run(), [run]);

  const setData = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      setDataState(prev =>
        typeof updater === "function" ? (updater as (p: T | undefined) => T)(prev) : updater
      );
    },
    []
  );

  return { data, loading, error, refetch, setData };
}
