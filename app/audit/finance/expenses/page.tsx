'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/shipment-utils/formatting';
import { formatDate } from '@/lib/utils';
import { mockAnalytics } from '@/data/mockData';
import {
  Receipt, Search, X, RotateCcw, ShieldAlert, DollarSign,
  TrendingDown, Fuel, Wrench, Users, Package,
} from 'lucide-react';

const CATEGORIES = ['All', 'Fuel', 'Maintenance', 'Staff Salary', 'Warehouse Rent', 'Utilities', 'Insurance', 'Office Supplies', 'Travel'];

interface MockExpense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor: string;
  status: string;
  invoiceRef: string;
}

const mockExpenses: MockExpense[] = Array.from({ length: 30 }, (_, i) => {
  const categories = ['Fuel', 'Maintenance', 'Staff Salary', 'Warehouse Rent', 'Utilities', 'Insurance', 'Office Supplies', 'Travel'];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  return {
    id: `exp-${String(i + 1).padStart(3, '0')}`,
    description: `${cat} - ${['Monthly', 'Quarterly', 'Annual', 'One-time'][Math.floor(Math.random() * 4)]}`,
    category: cat,
    amount: Math.floor(Math.random() * 100000) + 5000,
    date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
    vendor: ['Indian Oil Corp', 'Tata Motors', 'Adani Logistics', 'SBI', 'ICICI Lombard', 'Amazon Business'][Math.floor(Math.random() * 6)],
    status: ['Paid', 'Pending', 'Approved'][Math.floor(Math.random() * 3)],
    invoiceRef: `EXP-INV-${String(1000 + i)}`,
  };
});

export default function AuditExpensesPage() {
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = useMemo(() => {
    return mockExpenses.filter((e) => {
      const matchesSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.invoiceRef.toLowerCase().includes(search.toLowerCase()) || e.vendor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const totalExpenses = mockAnalytics.monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
  const fuelExpenses = filtered.filter(e => e.category === 'Fuel').reduce((s, e) => s + e.amount, 0);
  const maintenanceExpenses = filtered.filter(e => e.category === 'Maintenance').reduce((s, e) => s + e.amount, 0);
  const staffExpenses = filtered.filter(e => e.category === 'Staff Salary').reduce((s, e) => s + e.amount, 0);
  const otherExpenses = filtered.filter(e => !['Fuel', 'Maintenance', 'Staff Salary'].includes(e.category)).reduce((s, e) => s + e.amount, 0);

  const breakdown = useMemo(() => {
    const map = new Map<string, number>();
    mockExpenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => {
        const total = mockExpenses.reduce((s, e) => s + e.amount, 0);
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        return { category, amount, percentage };
      });
  }, []);

  const columns: Column<MockExpense>[] = useMemo(() => [
    {
      key: 'invoiceRef',
      header: 'Reference',
      render: (item) => (
        <span className="font-mono text-sm font-medium">{item.invoiceRef}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span className="font-medium">{formatINR(item.amount)}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="text-sm">{formatDate(item.date)}</span>,
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (item) => <span className="text-sm">{item.vendor}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ], []);

  const hasFilters = search || categoryFilter !== 'All';

  return (
    <PageWrapper
      title="Expenses"
      description="Read-only expense records"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Read-Only
          </Badge>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          title="Total Expenses"
          value={formatINR(totalExpenses)}
          icon={<Receipt className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Fuel"
          value={formatINR(fuelExpenses)}
          icon={<Fuel className="w-5 h-5" />}
          iconColor="amber"
        />
        <KPICard
          title="Maintenance"
          value={formatINR(maintenanceExpenses)}
          icon={<Wrench className="w-5 h-5" />}
          iconColor="teal"
        />
        <KPICard
          title="Staff"
          value={formatINR(staffExpenses)}
          icon={<Users className="w-5 h-5" />}
          iconColor="cyan"
        />
        <KPICard
          title="Other"
          value={formatINR(otherExpenses)}
          icon={<Package className="w-5 h-5" />}
          iconColor="red"
        />
      </div>

      {/* Search + Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by description, reference or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState rows={6} message="Loading expenses..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8 text-muted-foreground" />}
          title="No expenses found"
          description={
            hasFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'No expense records are available for audit review.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setCategoryFilter('All'); }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={filtered}
            columns={columns}
            pageSize={10}
            emptyMessage="No expenses match your criteria."
          />

          {/* Expense Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breakdown.map(({ category, amount, percentage }) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-sm font-medium min-w-[130px]">{category}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[90px] text-right">{formatINR(amount)}</span>
                    <span className="text-xs text-muted-foreground min-w-[36px] text-right">{percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
