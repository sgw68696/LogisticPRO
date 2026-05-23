'use client';
import { useState, useEffect } from 'react';
import { warehouseService } from '@/services/warehouseService';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { Users, Search, X, RotateCcw, Eye, Download, ArrowUpDown, Phone, Mail, MapPin, Package, Truck, FileText, Clock, User, Building2, ShoppingBag, RefreshCw, CalendarDays } from 'lucide-react';
import type { GoodsDispatchNote, GDNStatus } from '@/types/warehouse';

interface CustomerSummary {
  name: string;
  contact: string;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  lastOrderDate: string;
  gdns: GoodsDispatchNote[];
}

export default function CustomersPage() {
  const [gdns, setGdns] = useState<GoodsDispatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listGDNs();
      setGdns(data);
    } catch {
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const customers: CustomerSummary[] = Object.values(
    gdns.reduce((acc, gdn) => {
      if (!acc[gdn.customer]) {
        acc[gdn.customer] = {
          name: gdn.customer,
          contact: gdn.customerContact,
          totalOrders: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          lastOrderDate: gdn.dispatchDate,
          gdns: [],
        };
      }
      acc[gdn.customer].totalOrders++;
      if (gdn.status === 'Delivered') acc[gdn.customer].deliveredOrders++;
      else acc[gdn.customer].pendingOrders++;
      if (new Date(gdn.dispatchDate) > new Date(acc[gdn.customer].lastOrderDate)) {
        acc[gdn.customer].lastOrderDate = gdn.dispatchDate;
      }
      acc[gdn.customer].gdns.push(gdn);
      return acc;
    }, {} as Record<string, CustomerSummary>)
  );

  const filteredCustomers = search
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  const gdnStatusColors: Record<string, string> = {
    Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    Picking: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Packed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Loading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Dispatched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const kpis = [
    { title: 'Total Customers', value: customers.length, icon: <Users className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Active Orders', value: customers.reduce((s, c) => s + c.pendingOrders, 0), icon: <ShoppingBag className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Dispatched', value: gdns.filter(g => g.status === 'Dispatched').length, icon: <Truck className="w-5 h-5" />, iconColor: 'cyan' as const },
    { title: 'Delivered', value: gdns.filter(g => g.status === 'Delivered').length, icon: <Package className="w-5 h-5" />, iconColor: 'green' as const },
  ];

  const handleExport = () => {
    exportToCSV(
      filteredCustomers.map(c => ({
        name: c.name, contact: c.contact, totalOrders: c.totalOrders,
        pendingOrders: c.pendingOrders, deliveredOrders: c.deliveredOrders,
        lastOrderDate: c.lastOrderDate,
      })),
      'customers',
      [
        { key: 'name', label: 'Customer Name' }, { key: 'contact', label: 'Contact' },
        { key: 'totalOrders', label: 'Total Orders' }, { key: 'pendingOrders', label: 'Pending Orders' },
        { key: 'deliveredOrders', label: 'Delivered Orders' }, { key: 'lastOrderDate', label: 'Last Order Date' },
      ],
    );
    toast.success('Customers exported');
  };

  const columns: Column<CustomerSummary>[] = [
    { key: 'name', header: 'Customer Name', sortable: true, render: c => <span className="text-sm font-semibold">{c.name}</span> },
    { key: 'contact', header: 'Contact', render: c => <span className="text-xs text-muted-foreground">{c.contact}</span> },
    { key: 'totalOrders', header: 'Total Orders', sortable: true, render: c => <Badge variant="outline" className="text-xs">{c.totalOrders}</Badge> },
    { key: 'pendingOrders', header: 'Pending', sortable: true, render: c => <span className="text-xs font-medium text-amber-400">{c.pendingOrders}</span> },
    { key: 'deliveredOrders', header: 'Delivered', sortable: true, render: c => <span className="text-xs font-medium text-emerald-400">{c.deliveredOrders}</span> },
    { key: 'lastOrderDate', header: 'Last Order Date', sortable: true, render: c => <span className="text-xs text-muted-foreground">{formatDate(c.lastOrderDate)}</span> },
    {
      key: 'actions', header: 'Actions', render: c => (
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); setDetailDrawerOpen(true); }}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper title="Customers">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[300px] h-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
            <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          </div>
        </div>

        {/* Data */}
        {loading ? (
          <LoadingState rows={8} message="Loading customers..." />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No customers found" description={search ? 'Try a different search term' : 'No customers with dispatch notes yet'} />
        ) : (
          <DataTable data={filteredCustomers} columns={columns} searchKey={undefined} pageSize={25} />
        )}
      </div>

      {/* Detail Drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} direction="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>Customer Details</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4"><X className="w-4 h-4" /></DrawerClose>
          </DrawerHeader>
          {selectedCustomer && (
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Customer Info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.contact}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold">{selectedCustomer.totalOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Total Orders</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 text-center">
                  <p className="text-lg font-bold text-amber-400">{selectedCustomer.pendingOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
                  <p className="text-lg font-bold text-emerald-400">{selectedCustomer.deliveredOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Delivered</p>
                </div>
              </div>

              {/* GDNs */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dispatch Notes (GDNs)</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedCustomer.gdns.map(gdn => (
                    <div key={gdn.id} className="p-3 rounded-lg border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{gdn.gdnId}</span>
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border', gdnStatusColors[gdn.status] || '')}>{gdn.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>Ref: {gdn.orderRef}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>{gdn.totalItems} items ({gdn.totalQuantity} qty)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatDate(gdn.dispatchDate)}</span>
                      </div>
                      {gdn.items.length > 0 && (
                        <div className="pt-1 border-t border-border">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">Items:</p>
                          {gdn.items.slice(0, 3).map((item, i) => (
                            <div key={item.id || i} className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">{item.productName}</span>
                              <span className="font-mono">{item.requestedQuantity} {item.unit}</span>
                            </div>
                          ))}
                          {gdn.items.length > 3 && (
                            <p className="text-[10px] text-muted-foreground italic mt-1">+{gdn.items.length - 3} more items</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </PageWrapper>
  );
}

