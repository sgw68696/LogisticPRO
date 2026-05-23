'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Network, CheckCircle, Clock, XCircle } from 'lucide-react';
import { mockEdiMessages, type EdiMessage } from '@/data/mockCompanyTypeData';

const statusBadge = (s: EdiMessage['status']) => {
  const map: Record<string, string> = {
    Sent: 'bg-primary/10 text-primary border border-primary/20',
    Received: 'bg-success/10 text-success border border-success/20',
    Failed: 'bg-destructive/10 text-destructive border border-destructive/20',
    Processing: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };
  return map[s] ?? map.Processing;
};

const columns: Column<EdiMessage>[] = [
  { key: 'messageRef', header: 'Message Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.messageRef}</span> },
  { key: 'type', header: 'Type', render: (i) => <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold bg-primary/5 text-primary border border-primary/10">{i.type}</span> },
  { key: 'sender', header: 'Sender' },
  { key: 'receiver', header: 'Receiver' },
  { key: 'sentAt', header: 'Sent At' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'relatedShipment', header: 'Shipment' },
];

export default function EdiPage() {
  const [data] = useState(mockEdiMessages);
  const received = data.filter((d) => d.status === 'Received').length;
  const sent = data.filter((d) => d.status === 'Sent').length;
  const failed = data.filter((d) => d.status === 'Failed').length;

  return (
    <PageWrapper title="EDI List" description="Electronic Data Interchange messages">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Messages" value={data.length} icon={<Network size={18} />} iconColor="indigo" description="All EDI messages" />
        <KPICard title="Received" value={received} icon={<CheckCircle size={18} />} iconColor="green" description="Incoming" trend={{ value: 3, isPositive: true }} />
        <KPICard title="Sent" value={sent} icon={<Clock size={18} />} iconColor="cyan" description="Outgoing" />
        <KPICard title="Failed" value={failed} icon={<XCircle size={18} />} iconColor="red" description="Delivery failure" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search EDI messages..." searchKey="messageRef" pageSize={10} />
      </div>
    </PageWrapper>
  );
}
