import { useCallback, useEffect, useRef, useState } from "react";

type CacheEntry<T> = {
  data?: T;
  updatedAt: number;
  promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

export function getCachedData<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

export function setCachedData<T>(key: string, value: T | ((current: T | undefined) => T)) {
  const current = cache.get(key)?.data as T | undefined;
  const next = typeof value === "function"
    ? (value as (current: T | undefined) => T)(current)
    : value;

  cache.set(key, { data: next, updatedAt: Date.now() });
  notify(key);
}

export function updateCaches<T>(predicate: (key: string) => boolean, updater: (current: T) => T) {
  for (const [key, entry] of cache.entries()) {
    if (!predicate(key) || entry.data === undefined) continue;
    cache.set(key, { ...entry, data: updater(entry.data as T), updatedAt: Date.now() });
    notify(key);
  }
}

export function invalidateCache(predicate: (key: string) => boolean) {
  for (const [key, entry] of cache.entries()) {
    if (!predicate(key)) continue;
    cache.set(key, { ...entry, updatedAt: 0 });
    notify(key);
  }
}

async function fetchIntoCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const current = cache.get(key) as CacheEntry<T> | undefined;
  if (current?.promise) return current.promise;

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, updatedAt: Date.now() });
      notify(key);
      return data;
    })
    .finally(() => {
      const latest = cache.get(key) as CacheEntry<T> | undefined;
      if (latest?.promise) {
        cache.set(key, { data: latest.data, updatedAt: latest.updatedAt });
      }
    });

  cache.set(key, { data: current?.data, updatedAt: current?.updatedAt ?? 0, promise });
  return promise;
}

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { staleTime?: number; enabled?: boolean } = {},
) {
  const { staleTime = 60_000, enabled = true } = options;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const initial = getCachedData<T>(key);
  const [data, setDataState] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(enabled && initial === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const syncFromCache = useCallback(() => {
    setDataState(getCachedData<T>(key));
  }, [key]);

  useEffect(() => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(syncFromCache);
    syncFromCache();
    return () => {
      set?.delete(syncFromCache);
      if (set?.size === 0) listeners.delete(key);
    };
  }, [key, syncFromCache]);

  const refetch = useCallback(async (silent = true) => {
    if (!enabled) return undefined;
    const hasData = getCachedData<T>(key) !== undefined;
    if (!hasData || !silent) setLoading(!hasData);
    if (hasData) setRefreshing(true);
    setError("");
    try {
      return await fetchIntoCache<T>(key, () => fetcherRef.current());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const entry = cache.get(key);
    const hasData = entry?.data !== undefined;
    const isStale = !entry || Date.now() - entry.updatedAt > staleTime;

    if (!hasData) setLoading(true);
    if (isStale) {
      refetch(true).catch(() => undefined);
    } else {
      setLoading(false);
    }
  }, [enabled, key, refetch, staleTime]);

  const setData = useCallback((value: T | ((current: T | undefined) => T)) => {
    setCachedData<T>(key, value);
  }, [key]);

  return { data, loading, refreshing, error, setData, refetch };
}
