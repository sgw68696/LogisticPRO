'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { ConsolidatedShipment, ShipmentTimelineEvent } from '@/types/shipment';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import {
  Package, Search, X, RotateCcw, Eye, Truck, MapPin, Clock, CheckCircle2,
  AlertTriangle, Download, ArrowUpDown, User, Phone, CalendarDays, FileText, RefreshCw
} from 'lucide-react';

const statusFilters = ['All', 'Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];

export default function AgentShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listWarehouseShipments({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
      });
      setShipments(data);
    } catch {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const stats = useMemo(() => ({
    total: shipments.length,
    pending: shipments.filter((s: any) => s.status === 'Pending').length,
    inTransit: shipments.filter((s: any) => s.status === 'In Transit').length,
    outForDelivery: shipments.filter((s: any) => s.status === 'Out for Delivery').length,
  }), [shipments]);

  const handleView = (shipment: any) => {
    setSelectedShipment(shipment);
    setDrawerOpen(true);
  };

  const handleExportCSV = () => {
    if (shipments.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(
      shipments.map((s: any) => ({
        trackingNumber: s.trackingNumber,
        customerName: s.customerName || s.sender?.name || '',
        origin: s.route?.origin || s.pickupAddress || '',
        destination: s.route?.destination || s.deliveryAddress || '',
        serviceType: s.serviceType,
        pieces: s.package?.pieces || s.packageWeight || '',
        weight: s.package?.weight ? `${s.package.weight}kg` : '',
        status: s.status,
        estimatedDelivery: s.estimatedDelivery ? formatDate(s.estimatedDelivery) : '',
      })),
      'warehouse-shipments',
      [
        { key: 'trackingNumber', label: 'Tracking #' },
        { key: 'customerName', label: 'Customer' },
        { key: 'origin', label: 'Origin' },
        { key: 'destination', label: 'Destination' },
        { key: 'serviceType', label: 'Service' },
        { key: 'pieces', label: 'Pieces' },
        { key: 'weight', label: 'Weight' },
        { key: 'status', label: 'Status' },
        { key: 'estimatedDelivery', label: 'ETA' },
      ]
    );
    toast.success('Shipments exported');
  };

  const columns: Column<any>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking #',
      sortable: true,
      render: (s: any) => (
        <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (s: any) => (
        <span className="text-xs text-foreground">{s.customerName || s.sender?.name || '-'}</span>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (s: any) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate max-w-[160px]">
            {s.route?.origin || s.pickupAddress || 'N/A'} &rarr; {s.route?.destination || s.deliveryAddress || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      sortable: true,
      render: (s: any) => <span className="text-xs text-muted-foreground">{s.serviceType || '-'}</span>,
    },
    {
      key: 'package',
      header: 'Package',
      render: (s: any) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {s.package?.pieces || '-'}pcs &middot; {s.package?.weight || '-'}kg
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s: any) => <StatusBadge status={s.status} />,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      sortable: true,
      render: (s: any) => (
        <span className="text-xs text-muted-foreground">{s.estimatedDelivery ? formatDate(s.estimatedDelivery) : '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleView(s); }} title="View details">
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: shipments.length };
    statusFilters.slice(1).forEach((st) => { counts[st] = shipments.filter((s: any) => s.status === st).length; });
    return counts;
  }, [shipments]);

  return (
    <PageWrapper
      title="Warehouse Shipments"
      description="Manage warehouse-scoped shipments"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV} disabled={shipments.length === 0}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchShipments} disabled={loading}>
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total" value={stats.total} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="In Transit" value={stats.inTransit} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Out for Delivery" value={stats.outForDelivery} icon={<MapPin className="w-5 h-5" />} iconColor="teal" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking number or customer name..."
              className="pl-9 h-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusFilters.map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
                )}
              >
                {st}
                <span className="text-[0.6rem] opacity-60">({statusCounts[st] || 0})</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{shipments.length} shipment(s) found</p>
        )}
      </div>

      {loading ? (
        <LoadingState rows={8} message="Loading shipments..." />
      ) : shipments.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No shipments found"
          description={search || statusFilter !== 'All' ? 'No shipments match your search or filter criteria.' : 'No warehouse shipments available.'}
          action={
            (search || statusFilter !== 'All') ? (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={shipments}
          columns={columns}
          pageSize={15}
          onRowClick={handleView}
        />
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="border-b border-border/40 px-5 py-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                {selectedShipment?.trackingNumber || 'Shipment Details'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm"><X className="w-4 h-4" /></Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[70vh] p-5 space-y-5">
            {selectedShipment && (
              <>
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedShipment.status} />
                  <span className="text-[0.65rem] text-muted-foreground">
                    Created {formatDate(selectedShipment.createdAt, 'datetime')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sender</h4>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{selectedShipment.sender?.name || selectedShipment.senderName || '-'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {selectedShipment.sender?.phone || selectedShipment.senderPhone || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {selectedShipment.route?.origin || selectedShipment.pickupAddress || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receiver</h4>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{selectedShipment.receiver?.name || selectedShipment.receiverName || '-'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {selectedShipment.receiver?.phone || selectedShipment.receiverPhone || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {selectedShipment.route?.destination || selectedShipment.deliveryAddress || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedShipment.route?.origin || selectedShipment.pickupAddress || 'Origin'} &rarr; {selectedShipment.route?.destination || selectedShipment.deliveryAddress || 'Destination'}</span>
                  </div>
                  {selectedShipment.route?.distance && (
                    <p className="text-[0.65rem] text-muted-foreground/60 ml-5">Distance: {selectedShipment.route.distance} {selectedShipment.route.distanceUnit || 'km'}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package Details</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                      <p className="text-lg font-bold text-foreground">{selectedShipment.package?.pieces || selectedShipment.packageWeight || '-'}</p>
                      <p className="text-[0.6rem] text-muted-foreground mt-0.5">Pieces</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                      <p className="text-lg font-bold text-foreground">{selectedShipment.package?.weight ? `${selectedShipment.package.weight}kg` : '-'}</p>
                      <p className="text-[0.6rem] text-muted-foreground mt-0.5">Weight</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                      <p className="text-lg font-bold text-foreground">{selectedShipment.serviceType || '-'}</p>
                      <p className="text-[0.6rem] text-muted-foreground mt-0.5">Service</p>
                    </div>
                  </div>
                </div>

                {selectedShipment.estimatedDelivery && (
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">ETA:</span>
                    <span className="font-medium text-foreground">{formatDate(selectedShipment.estimatedDelivery, 'datetime')}</span>
                  </div>
                )}

                {selectedShipment.notes && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                    <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border/40">{selectedShipment.notes}</p>
                  </div>
                )}

                {(selectedShipment.timeline?.length > 0 || selectedShipment.trackingEvents?.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h4>
                    <div className="space-y-0">
                      {(selectedShipment.timeline || selectedShipment.trackingEvents || []).map((event: any, idx: number) => (
                        <div key={event.id || idx} className="flex gap-3 pb-3 relative">
                          {idx < (selectedShipment.timeline?.length || selectedShipment.trackingEvents?.length || 0) - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                          )}
                          <div className={cn(
                            'w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0',
                            event.status === 'Delivered' || event.type === 'Delivered'
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'bg-card border-muted-foreground/30'
                          )} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">{event.status || event.type}</p>
                            <p className="text-[0.6rem] text-muted-foreground">{event.location} &middot; {formatDate(event.timestamp, 'datetime')}</p>
                            {event.notes && <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5">{event.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </PageWrapper>
  );
}
