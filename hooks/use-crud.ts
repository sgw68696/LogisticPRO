'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PaginatedResponse } from '@/data/mock-db';

export interface UseCrudOptions<T, TFilters extends Record<string, unknown> = Record<string, unknown>> {
  fetchList: (filters?: TFilters) => Promise<PaginatedResponse<T>>;
  fetchById?: (id: string) => Promise<T | null>;
  createItem?: (data: Partial<T>) => Promise<T>;
  updateItem?: (id: string, data: Partial<T>) => Promise<T>;
  deleteItem?: (id: string) => Promise<void>;
  defaultPageSize?: number;
  autoFetch?: boolean;
  initialFilters?: TFilters;
}

export interface UseCrudState<T, TFilters> {
  items: T[];
  selectedItem: T | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  filters: TFilters;
  searchQuery: string;
  loading: boolean;
  loadingItem: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  selectedIds: string[];
}

export function useCrud<
  T extends { id: string },
  TFilters extends Record<string, unknown> = Record<string, unknown>
>(options: UseCrudOptions<T, TFilters>) {
  const {
    fetchList,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    defaultPageSize = 10,
    autoFetch = true,
    initialFilters = {} as TFilters,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchList({
        ...filters,
        page,
        pageSize,
        search: searchQuery || undefined,
      } as TFilters);
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchList, filters, page, pageSize, searchQuery]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  const getById = useCallback(
    async (id: string): Promise<T | null> => {
      if (!fetchById) return null;
      setLoadingItem(true);
      setError(null);
      try {
        const item = await fetchById(id);
        setSelectedItem(item);
        return item;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item');
        return null;
      } finally {
        setLoadingItem(false);
      }
    },
    [fetchById]
  );

  const create = useCallback(
    async (data: Partial<T>): Promise<T | null> => {
      if (!createItem) return null;
      setCreating(true);
      setError(null);
      try {
        const newItem = await createItem(data);
        setItems((prev) => [newItem, ...prev]);
        setTotal((prev) => prev + 1);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create item');
        return null;
      } finally {
        setCreating(false);
      }
    },
    [createItem]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T | null> => {
      if (!updateItem) return null;
      setUpdating(true);
      setError(null);
      try {
        const updatedItem = await updateItem(id, data);
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
        if (selectedItem?.id === id) {
          setSelectedItem(updatedItem);
        }
        return updatedItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update item');
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [updateItem, selectedItem]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!deleteItem) return false;
      setDeleting(true);
      setError(null);
      try {
        await deleteItem(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [deleteItem, selectedItem]
  );

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const changePageSize = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
    },
    []
  );

  const updateFilters = useCallback(
    (newFilters: Partial<TFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPage(1);
    },
    []
  );

  const updateSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
    },
    []
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((i) => i.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const state: UseCrudState<T, TFilters> = {
    items,
    selectedItem,
    total,
    page,
    pageSize,
    totalPages,
    hasMore,
    filters,
    searchQuery,
    loading,
    loadingItem,
    creating,
    updating,
    deleting,
    error,
    selectedIds,
  };

  return {
    state,
    fetchData,
    getById,
    create,
    update,
    remove,
    refresh,
    goToPage,
    changePageSize,
    updateFilters,
    updateSearch,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelectedItem,
  };
}

export default useCrud;
