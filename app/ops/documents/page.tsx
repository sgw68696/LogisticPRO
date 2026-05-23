'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCargo, mockShipments } from '@/data/mockData';
import {
  Search, X, FileText, Download, Eye,
  FileSignature, FileSpreadsheet, FileImage,
  File, FileCheck, Clock, CheckCircle2,
  AlertTriangle, RefreshCw,
} from 'lucide-react';

const DOC_TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  'Proof of Delivery': { icon: FileSignature, color: 'text-success', bg: 'bg-success/10' },
  'Waybill': { icon: FileSpreadsheet, color: 'text-primary', bg: 'bg-primary/10' },
  'Packing List': { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'Invoice': { icon: File, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  'Customs Doc': { icon: FileCheck, color: 'text-violet-400', bg: 'bg-violet-500/10' },
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const documents = useMemo(() => {
    const docs: Array<{
      id: string; type: string; referenceId: string; description: string;
      status: string; createdDate: string; shipmentId: string;
    }> = [];

    mockShipments.slice(0, 10).forEach(s => {
      docs.push({ id: `doc-${s.id}-pod`, type: 'Proof of Delivery', referenceId: s.trackingNumber, description: `POD for ${s.trackingNumber}`, status: s.status === 'Delivered' ? 'Available' : 'Pending', createdDate: s.updatedAt, shipmentId: s.id });
      docs.push({ id: `doc-${s.id}-waybill`, type: 'Waybill', referenceId: s.trackingNumber, description: `Waybill for ${s.trackingNumber}`, status: 'Available', createdDate: s.createdAt, shipmentId: s.id });
      docs.push({ id: `doc-${s.id}-invoice`, type: 'Invoice', referenceId: s.trackingNumber, description: `Invoice for ${s.trackingNumber}`, status: 'Available', createdDate: s.createdAt, shipmentId: s.id });
    });
    mockCargo.forEach(c => {
      docs.push({ id: `doc-${c.id}-packing`, type: 'Packing List', referenceId: c.cargoNumber, description: `Packing list for ${c.cargoNumber}`, status: 'Available', createdDate: c.createdAt, shipmentId: c.id });
    });
    return docs;
  }, []);

  const docTypes = useMemo(() => {
    const t = new Set(documents.map(d => d.type));
    return ['All', ...Array.from(t)];
  }, [documents]);

  const filtered = useMemo(() => {
    let data = documents;
    const q = search.toLowerCase();
    if (q) data = data.filter(d => d.referenceId.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
    if (typeFilter !== 'All') data = data.filter(d => d.type === typeFilter);
    return data;
  }, [documents, search, typeFilter]);

  const stats = useMemo(() => ({
    total: documents.length,
    available: documents.filter(d => d.status === 'Available').length,
    pending: documents.filter(d => d.status === 'Pending').length,
    types: docTypes.length - 1,
  }), [documents, docTypes]);

  const columns: Column<typeof documents[0]>[] = [
    {
      key: 'type', header: 'Type', sortable: true,
      render: (d) => {
        const meta = DOC_TYPE_META[d.type] || { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted/40' };
        const Icon = meta.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${meta.bg} border border-current/20 flex items-center justify-center ${meta.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[0.72rem] font-medium text-foreground">{d.type}</span>
          </div>
        );
      },
    },
    {
      key: 'referenceId', header: 'Reference',
      render: (d) => <span className="text-xs font-mono text-muted-foreground">{d.referenceId}</span>,
    },
    { key: 'description', header: 'Description', render: (d) => <span className="text-xs text-muted-foreground">{d.description}</span> },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'createdDate', header: 'Date',
      render: (d) => <span className="text-xs text-muted-foreground">{new Date(d.createdDate).toLocaleDateString()}</span>,
    },
    {
      key: 'actions', header: '',
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Download"><Download className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Documents" description="View and download shipment and cargo documents (read-only)">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Documents" value={stats.total} icon={<FileText className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Document Types" value={stats.types} icon={<File className="w-5 h-5" />} iconColor="cyan" />
      </div>

      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder="Search by reference ID, type, or description..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {docTypes.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${typeFilter === t ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={15} searchKey="description" />
    </PageWrapper>
  );
}
