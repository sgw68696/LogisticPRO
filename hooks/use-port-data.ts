'use client';

import { useState, useCallback, useEffect } from 'react';

interface UsePortDataOptions<T, F> {
  fetcher: (filters?: F) => Promise<T[]>;
  initialFilters?: F;
}

export function usePortData<T, F = Record<string, string | undefined>>(
  options: UsePortDataOptions<T, F>
) {
  const { fetcher, initialFilters } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<F | undefined>(initialFilters);

  const load = useCallback(async (overrideFilters?: F) => {
    setLoading(true);
    setError(null);
    try {
      const currentFilters = overrideFilters !== undefined ? overrideFilters : filters;
      const result = await fetcher(currentFilters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, filters]);

  useEffect(() => { load(); }, []);

  const updateFilters = useCallback((newFilters: F) => {
    setFilters(newFilters);
  }, []);

  const refresh = useCallback(() => {
    load(filters);
  }, [load, filters]);

  return { data, loading, error, filters, updateFilters, refresh, setData };
}

export function usePortCrud<T extends { id: string }>(
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  simulateDelay = true
) {
  const remove = useCallback(async (id: string) => {
    if (simulateDelay) await new Promise(r => setTimeout(r, 300));
    setData(prev => prev.filter(item => item.id !== id));
  }, [setData, simulateDelay]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    if (simulateDelay) await new Promise(r => setTimeout(r, 300));
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } as T : item));
  }, [setData, simulateDelay]);

  return { remove, update };
}
