'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle, CheckCircle2, Clock3, MapPinned,
  Package, Search, Ship, Truck, Plane, Filter, X,
} from 'lucide-react';
import type { ConsolidatedShipment } from '@/types/shipment';

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'Sea': return <Ship className="w-4 h-4" />;
    case 'Air': return <Plane className="w-4 h-4" />;
    default: return <Truck className="w-4 h-4" />;
  }
};

const getMode = (transportMode: string) => {
  switch (transportMode) {
    case 'Water': return 'Sea';
    case 'Air': return 'Air';
    default: return 'Land';
  }
};

export default function CompanyShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('Show All');

  useEffect(() => {
    shipmentService.list({ role: 'CompanyAdmin' }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.trackingNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.route.origin.toLowerCase().includes(q) ||
        s.route.destination.toLowerCase().includes(q);

      const matchesStage =
        stage === 'Show All' ||
        s.status === stage ||
        (stage === 'Sailing' && ['In Transit', 'Picked Up'].includes(s.status)) ||
        (stage === 'Arrived' && s.status === 'Delivered');

      return matchesSearch && matchesStage;
    });
  }, [shipments, search, stage]);

  const activeShipments = shipments.filter((s) => !['Delivered', 'Cancelled', 'Failed'].includes(s.status)).length;
  const inTransit = shipments.filter((s) => ['In Transit', 'Picked Up'].includes(s.status)).length;
  const delayed = shipments.filter((s) => ['Failed', 'Cancelled'].includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === 'Delivered').length;

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      sortable: true,
      render: (s) => <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (s) => <span className="text-xs text-foreground">{s.customerName}</span>,
    },
    {
      key: 'route',
      header: 'Route',
      render: (s) => (
        <span className="text-xs text-muted-foreground">{s.route.origin} → {s.route.destination}</span>
      ),
    },
    {
      key: 'route.transportMode',
      header: 'Mode',
      render: (s) => {
        const mode = getMode(s.route.transportMode);
        return (
          <Badge variant="outline" className="gap-1 text-[0.6rem]">
            {getModeIcon(mode)}
            {mode}
          </Badge>
        );
      },
    },
    {
      key: 'serviceType',
      header: 'Service',
      sortable: true,
      render: (s) => <span className="text-xs text-muted-foreground">{s.serviceType}</span>,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      sortable: true,
      render: (s) => <span className="text-xs text-muted-foreground">{formatDate(s.estimatedDelivery)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  const stageTabs = [
    { label: 'Show All', count: shipments.length },
    { label: 'Pending', count: shipments.filter((s) => s.status === 'Pending').length },
    { label: 'Booked', count: shipments.filter((s) => s.status === 'Picked Up').length },
    { label: 'Sailing', count: shipments.filter((s) => ['In Transit', 'Picked Up'].includes(s.status)).length },
    { label: 'Arrived', count: shipments.filter((s) => s.status === 'Delivered').length },
  ];

  if (loading) {
    return (
      <PageWrapper title="Shipments">
        <LoadingState rows={8} message="Loading shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Shipments">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Shipments" value={activeShipments} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="In Transit" value={inTransit} icon={<MapPinned className="w-5 h-5" />} iconColor="teal" />
        <KPICard title="Issues" value={delayed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Delivered" value={delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
      </div>

      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shipment, customer, or route..."
                className="w-full rounded-md border border-border bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {stageTabs.map((tab) => (
                <Button
                  key={tab.label}
                  variant={stage === tab.label ? 'default' : 'outline'}
                  onClick={() => setStage(tab.label)}
                  className="gap-2 text-xs"
                >
                  {tab.label}
                  <Badge variant="secondary" className="text-[0.6rem]">{tab.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2 border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Shipment Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtered.slice(0, 3).map((s) => {
                const mode = getMode(s.route.transportMode);
                return (
                  <div key={s.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="gap-1 text-[0.6rem]">
                        {getModeIcon(mode)}
                        {mode}
                      </Badge>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="font-semibold text-sm">{s.trackingNumber}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.customerName}</p>
                    <p className="text-sm mt-2">{s.route.origin} → {s.route.destination}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                      <Clock3 className="w-3.5 h-3.5" />
                      ETA: {formatDate(s.estimatedDelivery)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Operational Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Potential SLA Breach</p>
                  <p className="text-sm text-muted-foreground mt-1">3 shipments may miss ETA within the next 24 hours.</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <MapPinned className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Live Tracking Available</p>
                  <p className="text-sm text-muted-foreground mt-1">{inTransit} active shipments are broadcasting location updates.</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Delivered Today</p>
                  <p className="text-sm text-muted-foreground mt-1">{delivered} shipment records marked delivered in the current dataset.</p>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline">Open Live Map</Button>
          </CardContent>
        </Card>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent>
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title="No shipments found"
              description="No shipments match your current search or filter criteria."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Shipments</CardTitle>
            <Button variant="outline" className="gap-2 text-xs">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={filtered}
              columns={columns}
              pageSize={10}
              searchKey="trackingNumber"
              searchPlaceholder="Search shipments..."
            />
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
