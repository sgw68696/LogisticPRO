'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Users, UserCheck, UserX, Building2, Search } from 'lucide-react';

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const MOCK_USERS: OrgUser[] = [
  { id: 'usr-001', name: 'Amit Patel', email: 'amit@fasttrack.com', role: 'CompanyAdmin', company: 'FastTrack Logistics', status: 'Active', lastLogin: '2025-01-15 09:30' },
  { id: 'usr-002', name: 'Priya Sharma', email: 'priya@globalcargo.com', role: 'CompanyAdmin', company: 'Global Cargo Movers', status: 'Active', lastLogin: '2025-01-14 14:20' },
  { id: 'usr-003', name: 'Ravi Kumar', email: 'ravi@oceanic.com', role: 'Manager', company: 'Oceanic Shipping Co', status: 'Active', lastLogin: '2025-01-15 11:00' },
  { id: 'usr-004', name: 'Sneha Reddy', email: 'sneha@aircargo.com', role: 'CompanyAdmin', company: 'AirCargo Express', status: 'Active', lastLogin: '2025-01-13 16:45' },
  { id: 'usr-005', name: 'Vijay Singh', email: 'vijay@swiftexpress.com', role: 'CompanyAdmin', company: 'Swift Express Ltd', status: 'Inactive', lastLogin: '2024-12-20 08:00' },
  { id: 'usr-006', name: 'Neha Gupta', email: 'neha@roadrunner.com', role: 'Manager', company: 'RoadRunner Trucking', status: 'Active', lastLogin: '2025-01-12 10:30' },
];

export default function OrgAdminUsersPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_USERS.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<OrgUser>[] = [
    { key: 'name', header: 'Name', render: (i) => <span className="font-semibold">{i.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (i) => <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold bg-primary/5 text-primary border border-primary/10">{i.role}</span> },
    { key: 'company', header: 'Company', render: (i) => <span className="flex items-center gap-1.5"><Building2 size={12} className="text-muted-foreground" />{i.company}</span> },
    { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${i.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-muted/60 text-muted-foreground border border-border/50'}`}>{i.status}</span> },
    { key: 'lastLogin', header: 'Last Login' },
  ];

  return (
    <PageWrapper title="Users" description="All users across your organization's companies">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Users" value={MOCK_USERS.length} icon={<Users size={18} />} iconColor="indigo" description="Across all companies" />
        <KPICard title="Active" value={MOCK_USERS.filter((u) => u.status === 'Active').length} icon={<UserCheck size={18} />} iconColor="green" description="Currently active" />
        <KPICard title="Inactive" value={MOCK_USERS.filter((u) => u.status === 'Inactive').length} icon={<UserX size={18} />} iconColor="amber" description="Disabled accounts" />
        <KPICard title="Companies" value={new Set(MOCK_USERS.map((u) => u.company)).size} icon={<Building2 size={18} />} iconColor="cyan" description="Represented" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-4 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5" />
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={filtered} columns={columns} pageSize={10} />
      </div>
    </PageWrapper>
  );
}
