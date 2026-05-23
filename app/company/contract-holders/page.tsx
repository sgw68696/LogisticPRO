'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { mockContractHolders, type ContractHolder } from '@/data/mockCompanyTypeData';

const statusBadge = (s: ContractHolder['status']) => {
  const map: Record<string, string> = {
    Active: 'bg-success/10 text-success border border-success/20',
    'Expiring Soon': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Expired: 'bg-destructive/10 text-destructive border border-destructive/20',
    Renegotiating: 'bg-primary/10 text-primary border border-primary/20',
  };
  return map[s] ?? map.Active;
};

const typeBadge = (t: ContractHolder['type']) => {
  const map: Record<string, string> = {
    Shipper: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Consignee: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Forwarder: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Carrier: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  };
  return map[t] ?? map.Shipper;
};

const columns: Column<ContractHolder>[] = [
  { key: 'contractRef', header: 'Contract Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.contractRef}</span> },
  { key: 'holderName', header: 'Holder', render: (i) => <span className="font-semibold">{i.holderName}</span> },
  { key: 'type', header: 'Type', render: (i) => <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold ${typeBadge(i.type)}`}>{i.type}</span> },
  { key: 'startDate', header: 'Start Date' },
  { key: 'endDate', header: 'End Date' },
  {
    key: 'value', header: 'Value', render: (i) => (
      <span className="font-mono font-semibold">₹{(i.value / 100000).toFixed(1)}L</span>
    ),
  },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
];

export default function ContractHoldersPage() {
  const [data] = useState(mockContractHolders);
  const active = data.filter((d) => d.status === 'Active').length;
  const expiring = data.filter((d) => d.status === 'Expiring Soon').length;
  const expired = data.filter((d) => d.status === 'Expired').length;
  const totalValue = data.reduce((s, d) => s + d.value, 0);

  return (
    <PageWrapper title="Contract Holders" description="Contract holder management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Contracts" value={data.length} icon={<FileText size={18} />} iconColor="indigo" description="All contract holders" />
        <KPICard title="Active" value={active} icon={<CheckCircle size={18} />} iconColor="green" description="Current contracts" trend={{ value: 2, isPositive: true }} />
        <KPICard title="Expiring Soon" value={expiring} icon={<AlertTriangle size={18} />} iconColor="amber" description="Needs renewal" />
        <KPICard title="Total Value" value={`₹${(totalValue / 10000000).toFixed(1)}Cr`} icon={<XCircle size={18} />} iconColor="cyan" description="Combined contract value" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search contracts..." searchKey="holderName" pageSize={10} />
      </div>
    </PageWrapper>
  );
}
