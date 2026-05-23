'use client';

import { useState, useCallback, useMemo } from 'react';

interface UseAuditDataOptions<T, F> {
  fetcher: (filters?: F) => Promise<T[] | { items: T[]; total: number; totalPages: number }>;
  initialFilters?: F;
  pageSize?: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
}

export function useAuditData<T, F = Record<string, string | undefined>>(
  options: UseAuditDataOptions<T, F>
) {
  const { fetcher, initialFilters, pageSize = 20 } = options;
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<F | undefined>(initialFilters);

  const load = useCallback(async (overrideFilters?: F, overridePage?: number) => {
    setLoading(true);
    setError(null);
    try {
      const currentFilters = overrideFilters !== undefined ? overrideFilters : filters;
      const currentPage = overridePage !== undefined ? overridePage : page;
      const result = await fetcher({ ...currentFilters, page: currentPage, pageSize } as any);
      if (Array.isArray(result)) {
        setData(result);
        setTotal(result.length);
        setTotalPages(1);
      } else {
        const paginated = result as PaginatedResult<T>;
        setData(paginated.items);
        setTotal(paginated.total);
        setTotalPages(paginated.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, filters, page, pageSize]);

  const updateFilters = useCallback((newFilters: F) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const refresh = useCallback(() => {
    load(filters, page);
  }, [load, filters, page]);

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    page,
    filters,
    load,
    updateFilters,
    goToPage,
    refresh,
    setData,
  };
}

export function useAuditCrud<T extends { id: string }>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  simulateDelay = true
) {
  const create = useCallback(async (data: Partial<T>): Promise<T> => {
    if (simulateDelay) await new Promise(r => setTimeout(r, 300));
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: `${String(items.length + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    } as T;
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, [items.length, setItems, simulateDelay]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    if (simulateDelay) await new Promise(r => setTimeout(r, 300));
    let updated: T | null = null;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return item;
    }));
    return updated;
  }, [setItems, simulateDelay]);

  const remove = useCallback(async (id: string): Promise<void> => {
    if (simulateDelay) await new Promise(r => setTimeout(r, 300));
    setItems(prev => prev.filter(item => item.id !== id));
  }, [setItems, simulateDelay]);

  return { create, update, remove };
}
