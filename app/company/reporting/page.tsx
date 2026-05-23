'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { BarChart3, FileText, TrendingUp, Download } from 'lucide-react';
import { mockCompanyTypeReports, type CompanyTypeReport } from '@/data/mockCompanyTypeData';

const statusBadge = (s: CompanyTypeReport['status']) => {
  const map: Record<string, string> = {
    Ready: 'bg-success/10 text-success border border-success/20',
    Generating: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Scheduled: 'bg-primary/10 text-primary border border-primary/20',
  };
  return map[s] ?? map.Ready;
};

const typeBadge = (t: CompanyTypeReport['type']) => {
  const map: Record<string, string> = {
    Operational: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Financial: 'bg-success/10 text-success border border-success/20',
    Compliance: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Performance: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };
  return map[t] ?? map.Operational;
};

const columns: Column<CompanyTypeReport>[] = [
  { key: 'reportName', header: 'Report Name', render: (i) => <span className="font-semibold">{i.reportName}</span> },
  { key: 'type', header: 'Type', render: (i) => <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold ${typeBadge(i.type)}`}>{i.type}</span> },
  { key: 'period', header: 'Period' },
  { key: 'generatedAt', header: 'Generated At', render: (i) => i.generatedAt || <span className="text-muted-foreground italic">—</span> },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'size', header: 'Size' },
  {
    key: 'actions', header: '', render: (i) => i.status === 'Ready' ? (
      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
        <Download size={14} />
      </button>
    ) : null,
  },
];

export default function ReportingPage() {
  const [data] = useState(mockCompanyTypeReports);
  const ready = data.filter((d) => d.status === 'Ready').length;
  const generating = data.filter((d) => d.status === 'Generating').length;

  return (
    <PageWrapper title="Reporting" description="Operational reporting and analytics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Reports" value={data.length} icon={<BarChart3 size={18} />} iconColor="indigo" description="All reports" />
        <KPICard title="Ready for Download" value={ready} icon={<Download size={18} />} iconColor="green" description="Available now" trend={{ value: 5, isPositive: true }} />
        <KPICard title="Generating" value={generating} icon={<TrendingUp size={18} />} iconColor="amber" description="In progress" />
        <KPICard title="Report Types" value={4} icon={<FileText size={18} />} iconColor="cyan" description="Op/Fin/Comp/Perf" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search reports..." searchKey="reportName" pageSize={10} />
      </div>
    </PageWrapper>
  );
}
