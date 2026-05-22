'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockCargo } from '@/data/mockData';
import {
  Search, X, Container, Anchor, MapPin,
  Weight, Package, Clock, RefreshCw,
  AlertTriangle, CheckCircle2, Globe,
} from 'lucide-react';

export default function ContainerTrackingPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const cargoes = useMemo(() => mockCargo, []);

  const statuses = useMemo(() => {
    const s = new Set(cargoes.map(c => c.status));
    return ['All', ...Array.from(s)];
  }, [cargoes]);
  const types = useMemo(() => {
    const t = new Set(cargoes.map(c => c.type));
    return ['All', ...Array.from(t)];
  }, [cargoes]);

  const filtered = useMemo(() => {
    let data = cargoes;
    const q = search.toLowerCase();
    if (q) data = data.filter(c => c.cargoNumber.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.shipper.name.toLowerCase().includes(q));
    if (statusFilter !== 'All') data = data.filter(c => c.status === statusFilter);
    if (typeFilter !== 'All') data = data.filter(c => c.type === typeFilter);
    return data;
  }, [cargoes, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: cargoes.length,
    inTransit: cargoes.filter(c => c.status === 'In Transit').length,
    delivered: cargoes.filter(c => c.status === 'Delivered').length,
    pending: cargoes.filter(c => c.status === 'Pending').length,
  }), [cargoes]);

  const columns: Column<typeof cargoes[0]>[] = [
    {
      key: 'cargo', header: 'Cargo', sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Container className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[0.78rem] font-medium text-foreground font-mono">{c.cargoNumber}</p>
            <p className="text-[0.6rem] text-muted-foreground truncate max-w-[160px]">{c.description}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, render: (c) => <StatusBadge status={c.type} /> },
    {
      key: 'weight', header: 'Weight',
      render: (c) => <span className="text-xs text-muted-foreground">{c.weight} {c.weightUnit}</span>,
    },
    {
      key: 'shipper', header: 'Shipper',
      render: (c) => <span className="text-xs text-foreground">{c.shipper.name}</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'location', header: 'Location',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {c.currentLocation?.lastUpdate || 'In Transit'}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Container Tracking" description="Track container shipments and cargo movements">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Containers" value={stats.total} icon={<Container className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="In Transit" value={stats.inTransit} icon={<Anchor className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
      </div>

      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder="Search cargo..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-1.5">
              {statuses.map(st => (
                <button key={st} onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${statusFilter === st ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{st}</button>
              ))}
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-[0.7rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50">
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={15} searchKey="cargoNumber" />
    </PageWrapper>
  );
}
