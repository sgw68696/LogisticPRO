"use client";

import { useState, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  // Controlled pagination — use when data is fetched page-by-page from server
  controlledPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  pageSize = 10,
  pageSizeOptions = [10, 50, 100, 150, 200, 250],
  onPageSizeChange,
  onRowClick,
  emptyMessage = "No data found",
  loading = false,
  controlledPagination,
  currentPage: controlledPage,
  totalPages: controlledTotalPages,
  totalItems: controlledTotalItems,
  onPageChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localPage, setLocalPage] = useState(1);

  const isControlled = controlledPagination && controlledPage !== undefined && controlledTotalPages !== undefined;
  const currentPage = isControlled ? controlledPage : localPage;

  // Filter data (only in uncontrolled mode)
  const filteredData = (!isControlled && searchKey && search)
    ? data.filter(item => {
        const value = item[searchKey];
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    : data;

  // Sort data (only in uncontrolled mode; controlled mode assumes server-sorted)
  const sortedData = (!isControlled && sortKey)
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  // Paginate data (only in uncontrolled mode)
  const totalPages = isControlled ? controlledTotalPages : Math.ceil(sortedData.length / pageSize);
  const paginatedData = isControlled
    ? data  // parent passes only current-page data
    : sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    if (isControlled) {
      onPageChange?.(page);
    } else {
      setLocalPage(page);
    }
  };

  const handleSort = (key: string) => {
    if (isControlled) return;
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchKey && !isControlled && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLocalPage(1);
            }}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "font-semibold",
                    column.sortable && "cursor-pointer select-none",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Show</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              if (isControlled) {
                onPageSizeChange?.(newSize);
              } else {
                setLocalPage(1);
                // In uncontrolled mode, pageSize is just a const, so we need state
              }
            }}
            className="h-8 rounded-md border border-border bg-muted/40 px-2 text-sm text-foreground outline-none focus:border-primary/50"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {paginatedData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, isControlled ? (controlledTotalItems ?? paginatedData.length) : sortedData.length)} of {isControlled ? (controlledTotalItems ?? paginatedData.length) : sortedData.length} entries
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {(() => {
              const pages: (number | string)[] = [];
              const range = 1;
              pages.push(1);
              const start = Math.max(2, currentPage - range);
              const end = Math.min(totalPages - 1, currentPage + range);
              if (start > 2) pages.push('...');
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages - 1) pages.push('...');
              if (totalPages > 1) pages.push(totalPages);
              return pages.map((page, idx) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[32px]"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                )
              );
            })()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
