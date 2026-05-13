'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Ship,
  Anchor,
  Search,
  CalendarDays,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Dock,
} from 'lucide-react';

type VesselRow = {
  id: string;
  vessel: string;
  imo: string;
  voyage: string;
  port: string;
  berth: string;
  eta: string;
  etd: string;
  cargo: string;
  status: string;
};

const vessels: VesselRow[] = [
  {
    id: 'VES-001',
    vessel: 'CMA CGM ALTAMIRA',
    imo: '9961350',
    voyage: 'CNYTN-ALT-2026-04',
    port: 'Yantian',
    berth: 'B-12',
    eta: '2026-05-13 08:15',
    etd: '2026-05-13 18:30',
    cargo: '34 Containers',
    status: 'Arrived',
  },
  {
    id: 'VES-002',
    vessel: 'MAERSK GUJARAT',
    imo: '9345821',
    voyage: 'INMUM-SGSIN-2026-11',
    port: 'Singapore',
    berth: 'C-03',
    eta: '2026-05-14 14:00',
    etd: '2026-05-15 02:00',
    cargo: '52 Containers',
    status: 'Sailing',
  },
  {
    id: 'VES-003',
    vessel: 'MSC ZOE',
    imo: '9212345',
    voyage: 'LKCMB-JPTYO-2026-05',
    port: 'Colombo',
    berth: 'A-07',
    eta: '2026-05-13 22:45',
    etd: '2026-05-14 10:30',
    cargo: '18 Containers',
    status: 'Berthing',
  },
  {
    id: 'VES-004',
    vessel: 'OOCL HONG KONG',
    imo: '9705123',
    voyage: 'SGSIN-INNSA-2026-08',
    port: 'Mumbai',
    berth: 'D-04',
    eta: '2026-05-15 06:10',
    etd: '2026-05-15 20:00',
    cargo: '28 Containers',
    status: 'Expected',
  },
];

export default function PortVesselsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    return vessels.filter((v) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        v.vessel.toLowerCase().includes(q) ||
        v.imo.toLowerCase().includes(q) ||
        v.port.toLowerCase().includes(q) ||
        v.voyage.toLowerCase().includes(q);

      const matchesFilter = filter === 'All' || v.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const arrivals = vessels.filter((v) => v.status === 'Arrived').length;
  const sailing = vessels.filter((v) => v.status === 'Sailing').length;
  const berthing = vessels.filter((v) => v.status === 'Berthing').length;
  const expected = vessels.filter((v) => v.status === 'Expected').length;

  const columns: Column<VesselRow>[] = [
    { key: 'vessel', header: 'Vessel', sortable: true },
    { key: 'imo', header: 'IMO', sortable: true },
    { key: 'voyage', header: 'Voyage', sortable: true },
    { key: 'port', header: 'Port', sortable: true },
    {
      key: 'berth',
      header: 'Berth',
      render: (item) => (
        <Badge variant="outline" className="gap-1">
          <Dock className="w-3.5 h-3.5" />
          {item.berth}
        </Badge>
      ),
    },
    { key: 'eta', header: 'ETA', sortable: true },
    { key: 'etd', header: 'ETD', sortable: true },
    { key: 'cargo', header: 'Cargo', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <PageWrapper title="Vessel Schedule">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Arrived" value={arrivals} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Sailing" value={sailing} icon={<Ship className="w-5 h-5" />} iconColor="blue" />
        <KPICard title="Berthing" value={berthing} icon={<Anchor className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Expected" value={expected} icon={<Clock3 className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vessel, IMO, voyage, or port..."
                className="w-full rounded-md border border-border bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Arrived', 'Sailing', 'Berthing', 'Expected'].map((item) => (
                <Button
                  key={item}
                  variant={filter === item ? 'default' : 'outline'}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2 border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Port Vessel Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={filtered}
              columns={columns}
              pageSize={8}
              searchKey="vessel"
              searchPlaceholder="Search vessels..."
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Port Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Next Arrival</p>
              <p className="text-sm font-semibold mt-1">OOCL HONG KONG</p>
              <p className="text-xs text-muted-foreground mt-1">ETA 2026-05-15 06:10</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Containers In Port</p>
              <p className="text-2xl font-bold mt-1">182</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Cargo Pending Offload</p>
              <p className="text-2xl font-bold mt-1">41</p>
            </div>
            <Button className="w-full gap-2">
              <CalendarDays className="w-4 h-4" />
              Open Berth Planner
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}