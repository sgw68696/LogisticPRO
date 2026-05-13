'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPinned,
  Package,
  Search,
  Ship,
  Truck,
  Plane,
  Train,
  Filter,
} from 'lucide-react';
import { mockShipments } from '@/data/mockData';

type ShipmentRow = {
  id: string;
  customer: string;
  route: string;
  mode: string;
  service: string;
  eta: string;
  status: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const routeFromShipment = (pickup: string, delivery: string) => {
  const from = pickup.split(',').at(-1)?.trim() ?? pickup;
  const to = delivery.split(',').at(-1)?.trim() ?? delivery;
  return `${from} to ${to}`;
};

const getMode = (serviceType?: string) => {
  const value = String(serviceType || '').toLowerCase();
  if (value.includes('air')) return 'Air';
  if (value.includes('sea')) return 'Sea';
  if (value.includes('rail')) return 'Rail';
  return 'Road';
};

const modeIcon = (mode: string) => {
  if (mode === 'Sea') return <Ship className="w-4 h-4" />;
  if (mode === 'Air') return <Plane className="w-4 h-4" />;
  if (mode === 'Rail') return <Train className="w-4 h-4" />;
  return <Truck className="w-4 h-4" />;
};

export default function CompanyShipmentsPage() {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('Show All');

  const rows: ShipmentRow[] = mockShipments.map((shipment) => ({
    id: shipment.trackingNumber,
    customer: shipment.customerName || shipment.customer || 'Customer',
    route: routeFromShipment(shipment.pickupAddress, shipment.deliveryAddress),
    mode: getMode(shipment.serviceType),
    service: shipment.serviceType,
    eta: formatDate(shipment.estimatedDelivery),
    status: shipment.status,
  }));

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q) ||
        row.route.toLowerCase().includes(q);

      const matchesStage =
        stage === 'Show All' ||
        row.status.toLowerCase() === stage.toLowerCase() ||
        (stage === 'Sailing' && ['In Transit', 'On Route'].includes(row.status)) ||
        (stage === 'Arrived' && row.status === 'Delivered');

      return matchesSearch && matchesStage;
    });
  }, [rows, search, stage]);

  const activeShipments = rows.filter((r) => !['Delivered', 'Cancelled', 'Failed'].includes(r.status)).length;
  const inTransit = rows.filter((r) => ['In Transit', 'On Route', 'Confirmed'].includes(r.status)).length;
  const delayed = rows.filter((r) => ['Pending', 'Failed'].includes(r.status)).length;
  const delivered = rows.filter((r) => r.status === 'Delivered').length;

  const columns: Column<ShipmentRow>[] = [
    { key: 'id', header: 'Tracking ID', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true },
    { key: 'route', header: 'Route', sortable: true },
    {
      key: 'mode',
      header: 'Mode',
      render: (item) => (
        <Badge variant="outline" className="gap-1">
          {modeIcon(item.mode)}
          {item.mode}
        </Badge>
      ),
    },
    { key: 'service', header: 'Service', sortable: true },
    { key: 'eta', header: 'ETA', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const stageTabs = [
    { label: 'Show All', count: rows.length },
    { label: 'New', count: rows.filter((r) => r.status === 'Pending').length },
    { label: 'Booked', count: rows.filter((r) => r.status === 'Confirmed').length },
    { label: 'Sailing', count: rows.filter((r) => ['In Transit', 'On Route'].includes(r.status)).length },
    { label: 'Arrived', count: rows.filter((r) => r.status === 'Delivered').length },
  ];

  return (
    <PageWrapper title="Shipments">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Shipments" value={activeShipments} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="In Transit" value={inTransit} icon={<MapPinned className="w-5 h-5" />} iconColor="teal" />
        <KPICard title="Delayed / Risk" value={delayed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
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
            </div>

            <div className="flex flex-wrap gap-2">
              {stageTabs.map((tab) => (
                <Button
                  key={tab.label}
                  variant={stage === tab.label ? 'default' : 'outline'}
                  onClick={() => setStage(tab.label)}
                  className="gap-2"
                >
                  {tab.label}
                  <Badge variant="secondary">{tab.count}</Badge>
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
              {filteredRows.slice(0, 3).map((row) => (
                <div key={row.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="gap-1">
                      {modeIcon(row.mode)}
                      {row.mode}
                    </Badge>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="font-semibold text-sm">{row.id}</p>
                  <p className="text-sm text-muted-foreground mt-1">{row.customer}</p>
                  <p className="text-sm mt-2">{row.route}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <Clock3 className="w-3.5 h-3.5" />
                    ETA: {row.eta}
                  </div>
                </div>
              ))}
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
                  <p className="text-sm text-muted-foreground mt-1">12 active shipments are broadcasting location updates.</p>
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
            <Button className="w-full">Open Live Map</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card shadow-soft">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Shipments</CardTitle>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable
            data={filteredRows}
            columns={columns}
            pageSize={10}
            searchKey="id"
            searchPlaceholder="Search shipments..."
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}