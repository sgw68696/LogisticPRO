'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Building2, Users, FileText, Search, Plus, Eye, Edit, Trash2, Check, AlertCircle, X, Loader2 } from 'lucide-react';

interface ManagedCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
  type: string;
  plan: string;
  agentCount: number;
  userCount: number;
  createdAt: string;
}

const MOCK_COMPANIES: ManagedCompany[] = [
  { id: 'cmp-001', name: 'FastTrack Logistics', email: 'admin@fasttrack.com', phone: '+91 98765 43210', status: 'Active', type: 'custom_agent', plan: 'Enterprise', agentCount: 15, userCount: 8, createdAt: '2024-06-15' },
  { id: 'cmp-002', name: 'Global Cargo Movers', email: 'info@globalcargo.com', phone: '+91 87654 32109', status: 'Active', type: 'transporter', plan: 'Professional', agentCount: 23, userCount: 12, createdAt: '2024-07-01' },
  { id: 'cmp-003', name: 'Swift Express Ltd', email: 'contact@swiftexpress.com', phone: '+91 76543 21098', status: 'Pending', type: 'origin_agent', plan: 'Starter', agentCount: 0, userCount: 1, createdAt: '2025-01-10' },
  { id: 'cmp-004', name: 'Oceanic Shipping Co', email: 'ops@oceanicshipping.com', phone: '+91 65432 10987', status: 'Active', type: 'destination_agent', plan: 'Enterprise', agentCount: 31, userCount: 18, createdAt: '2024-03-20' },
  { id: 'cmp-005', name: 'RoadRunner Trucking', email: 'dispatch@roadrunner.com', phone: '+91 54321 09876', status: 'Suspended', type: 'trucking_agent', plan: 'Professional', agentCount: 8, userCount: 4, createdAt: '2024-09-05' },
  { id: 'cmp-006', name: 'AirCargo Express', email: 'admin@aircargo.com', phone: '+91 43210 98765', status: 'Active', type: 'custom_agent', plan: 'Professional', agentCount: 12, userCount: 6, createdAt: '2024-11-12' },
];

const statusBadge: Record<string, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  Pending: 'bg-warning/10 text-warning border border-warning/20',
  Suspended: 'bg-destructive/10 text-destructive border border-destructive/20',
  Inactive: 'bg-muted/60 text-muted-foreground border border-border/50',
};

export default function OrgAdminCompaniesPage() {
  const router = useRouter();
  const [companies] = useState(MOCK_COMPANIES);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filtered = companies.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ManagedCompany>[] = [
    {
      key: 'name', header: 'Company Name', sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-semibold text-foreground">{item.name}</p>
            <p className="text-[0.70rem] text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (i) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge[i.status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${i.status === 'Active' ? 'bg-success' : i.status === 'Pending' ? 'bg-warning' : i.status === 'Suspended' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
        {i.status}
      </span>
    )},
    { key: 'type', header: 'Type', render: (i) => <span className="text-[0.80rem] capitalize">{i.type.replace(/_/g, ' ')}</span> },
    { key: 'plan', header: 'Plan' },
    { key: 'agentCount', header: 'Agents' },
    { key: 'userCount', header: 'Users' },
    {
      key: 'actions', header: '', render: (i) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={() => router.push(`/orgadmin/companies/detail?id=${i.id}`)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"><Eye size={14} /></button>
          <button onClick={() => router.push(`/orgadmin/companies/create?id=${i.id}`)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400"><Edit size={14} /></button>
          <button onClick={() => { showToast(`${i.name} deleted`, 'success'); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Companies"
      description="Manage companies under your organization"
      actions={
        <button onClick={() => router.push('/orgadmin/companies/create')} className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <Plus size={14} />
          New Company
        </button>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Companies" value={companies.length} icon={<Building2 size={18} />} iconColor="indigo" description="Under your organization" />
        <KPICard title="Active" value={companies.filter((c) => c.status === 'Active').length} icon={<Building2 size={18} />} iconColor="green" description="Fully operational" />
        <KPICard title="Pending" value={companies.filter((c) => c.status === 'Pending').length} icon={<FileText size={18} />} iconColor="amber" description="Awaiting approval" />
        <KPICard title="Total Agents" value={companies.reduce((s, c) => s + c.agentCount, 0)} icon={<Users size={18} />} iconColor="cyan" description="Across all companies" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-4 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5" />
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={filtered} columns={columns} searchPlaceholder="" pageSize={10} />
      </div>
    </PageWrapper>
  );
}
