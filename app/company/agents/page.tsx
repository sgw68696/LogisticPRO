'use client';

import { useState, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { ALL_COMPANY_TYPE_MENU_IDS } from '@/hooks/use-accessible-menus';
import {
  Users, UserPlus, Search, Eye, Edit, Trash2, Check, X,
  Loader2, ShieldCheck, Menu as MenuIcon, Save, AlertCircle,
  Building2, Mail, Phone, Tag,
} from 'lucide-react';

interface ManagedAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agentType: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  assignedMenus: string[];
  createdAt: string;
}

const ALL_AVAILABLE_MENUS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings-rates', label: 'Bookings & Rates' },
  { id: 'shipments', label: 'Shipments' },
  { id: 'documents', label: 'Documents' },
  { id: 'compliance-customs', label: 'Compliance & Customs' },
  { id: 'dispatch-fleet', label: 'Dispatch & Fleet' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'customers-agents', label: 'Customers & Agents' },
  { id: 'finance', label: 'Finance' },
  { id: 'reports', label: 'Reports' },
  { id: 'users-settings', label: 'Users & Settings' },
  ...ALL_COMPANY_TYPE_MENU_IDS.map((id) => ({
    id,
    label: id.replace('ct-', '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  })),
];

const AGENT_TYPE_OPTIONS = ['warehouse', 'driver', 'finance', 'customs', 'port', 'tracking', 'transport'];

const MOCK_AGENTS: ManagedAgent[] = [
  { id: 'agt-001', name: 'Sunita Reddy', email: 'sunita@techlogistics.com', phone: '+91 98765 43213', agentType: 'warehouse', status: 'Active', assignedMenus: ['dashboard', 'shipments', 'documents', 'warehouse'], createdAt: '2024-04-05' },
  { id: 'agt-002', name: 'Mohammed Khan', email: 'mohammed@techlogistics.com', phone: '+91 98765 43214', agentType: 'driver', status: 'Active', assignedMenus: ['dashboard', 'dispatch-fleet', 'reports', 'ct-planning', 'ct-delivery-lines'], createdAt: '2024-05-20' },
  { id: 'agt-003', name: 'Ananya Gupta', email: 'ananya@techlogistics.com', phone: '+91 98765 43215', agentType: 'finance', status: 'Active', assignedMenus: ['dashboard', 'finance', 'reports'], createdAt: '2024-06-12' },
  { id: 'agt-004', name: 'Rajesh Verma', email: 'rajesh@techlogistics.com', phone: '+91 98765 43216', agentType: 'customs', status: 'Active', assignedMenus: ['dashboard', 'compliance-customs', 'documents', 'ct-editor', 'ct-container-reports'], createdAt: '2024-07-01' },
  { id: 'agt-005', name: 'Priya Nair', email: 'priya@techlogistics.com', phone: '+91 98765 43217', agentType: 'port', status: 'Inactive', assignedMenus: ['dashboard', 'shipments'], createdAt: '2024-08-15' },
];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  Inactive: 'bg-muted/60 text-muted-foreground border border-border/50',
  Suspended: 'bg-destructive/10 text-destructive border border-destructive/20',
};

export default function AgentsManagementPage() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showMenuAssign, setShowMenuAssign] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<ManagedAgent | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', agentType: 'warehouse', status: 'Active' as 'Active' | 'Inactive' | 'Suspended' });
  const [menuAssignments, setMenuAssignments] = useState<Record<string, string[]>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filtered = agents.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name || !form.email) { showToast('Name and email are required', 'error'); return; }
    const newAgent: ManagedAgent = {
      id: `agt-${String(Date.now()).slice(-6)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      agentType: form.agentType,
      status: form.status,
      assignedMenus: ['dashboard'],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAgents([newAgent, ...agents]);
    setShowCreate(false);
    setForm({ name: '', email: '', phone: '', agentType: 'warehouse', status: 'Active' as const });
    showToast('Agent created successfully', 'success');
  };

  const toggleMenu = (agentId: string, menuId: string) => {
    setMenuAssignments((prev) => {
      const current = prev[agentId] ?? agents.find((a) => a.id === agentId)?.assignedMenus ?? [];
      const updated = current.includes(menuId)
        ? current.filter((m) => m !== menuId)
        : [...current, menuId];
      return { ...prev, [agentId]: updated };
    });
  };

  const saveMenuAssignments = (agentId: string) => {
    const newMenus = menuAssignments[agentId];
    if (!newMenus) return;
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, assignedMenus: newMenus } : a)));
    setShowMenuAssign(null);
    showToast('Menu assignments saved', 'success');
  };

  const columns: Column<ManagedAgent>[] = [
    {
      key: 'name', header: 'Agent Name',
      render: (i) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-semibold text-foreground">{i.name}</p>
            <p className="text-[0.70rem] text-muted-foreground">{i.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'agentType', header: 'Type', render: (i) => <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.70rem] font-bold bg-primary/5 text-primary border border-primary/10 capitalize">{i.agentType}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (i) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${STATUS_STYLES[i.status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${i.status === 'Active' ? 'bg-success' : i.status === 'Inactive' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
        {i.status}
      </span>
    )},
    { key: 'assignedMenus', header: 'Menus', render: (i) => (
      <span className="text-[0.72rem] text-muted-foreground">{i.assignedMenus.length} modules</span>
    )},
    {
      key: 'actions', header: '', render: (i) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={() => { setShowMenuAssign(i.id); setMenuAssignments((p) => ({ ...p, [i.id]: i.assignedMenus })); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="Assign Menus">
            <MenuIcon size={14} />
          </button>
          <button onClick={() => { setEditingAgent(i); setForm({ name: i.name, email: i.email, phone: i.phone, agentType: i.agentType, status: i.status as 'Active' | 'Inactive' | 'Suspended' }); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors" title="Edit">
            <Edit size={14} />
          </button>
          <button onClick={() => { setAgents((prev) => prev.filter((a) => a.id !== i.id)); showToast('Agent removed', 'success'); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Agent Management"
      description="Create and manage agents, assign module access"
      actions={
        <button onClick={() => { setForm({ name: '', email: '', phone: '', agentType: 'warehouse', status: 'Active' as const }); setShowCreate(true); }} className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          <UserPlus size={14} />
          Add Agent
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
        <KPICard title="Total Agents" value={agents.length} icon={<Users size={18} />} iconColor="indigo" description="All agents" />
        <KPICard title="Active" value={agents.filter((a) => a.status === 'Active').length} icon={<ShieldCheck size={18} />} iconColor="green" description="Currently active" />
        <KPICard title="Inactive" value={agents.filter((a) => a.status === 'Inactive').length} icon={<X size={18} />} iconColor="amber" description="Disabled" />
        <KPICard title="Agent Types" value={new Set(agents.map((a) => a.agentType)).size} icon={<Tag size={18} />} iconColor="cyan" description="Unique types" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-4 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5" />
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={filtered} columns={columns} pageSize={10} />
      </div>

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <h2 className="text-[1rem] font-bold font-display text-foreground">Create Agent</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'name' as const, label: 'Name', required: true },
                { key: 'email' as const, label: 'Email', type: 'email', required: true },
                { key: 'phone' as const, label: 'Phone' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5" />
                </div>
              ))}
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Agent Type</label>
                <select value={form.agentType} onChange={(e) => setForm({ ...form, agentType: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none">
                  {AGENT_TYPE_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && !showMenuAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingAgent(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <h2 className="text-[1rem] font-bold font-display text-foreground">Edit Agent</h2>
              <button onClick={() => setEditingAgent(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'name' as const, label: 'Name' },
                { key: 'email' as const, label: 'Email' },
                { key: 'phone' as const, label: 'Phone' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}</label>
                  <input type="text" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" />
                </div>
              ))}
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <button onClick={() => { setAgents((prev) => prev.map((a) => a.id === editingAgent.id ? { ...a, name: form.name, email: form.email, phone: form.phone, status: form.status } : a)); setEditingAgent(null); showToast('Agent updated', 'success'); }} className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Menu Assignment Panel */}
      {showMenuAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMenuAssign(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div>
                <h2 className="text-[1rem] font-bold font-display text-foreground">Assign Module Access</h2>
                <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                  {agents.find((a) => a.id === showMenuAssign)?.name}
                </p>
              </div>
              <button onClick={() => setShowMenuAssign(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={18} /></button>
            </div>
            <div className="p-5">
              <p className="text-[0.78rem] text-muted-foreground mb-4">
                Select the modules this agent can access. Unchecked modules will be hidden from their sidebar.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ALL_AVAILABLE_MENUS.map((menu) => {
                  const isChecked = (menuAssignments[showMenuAssign] ?? agents.find((a) => a.id === showMenuAssign)?.assignedMenus ?? []).includes(menu.id);
                  return (
                    <label
                      key={menu.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/5 border-primary/30 text-foreground'
                          : 'bg-muted/20 border-border/40 text-muted-foreground hover:border-primary/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMenu(showMenuAssign, menu.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-[0.82rem] font-medium">{menu.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/40">
                <button onClick={() => setShowMenuAssign(null)} className="px-4 py-2 rounded-[10px] text-[0.82rem] font-medium text-muted-foreground border border-border/60 hover:bg-muted/40 transition-all">
                  Cancel
                </button>
                <button onClick={() => saveMenuAssignments(showMenuAssign)} className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[0.82rem] font-bold text-white transition-all hover:-translate-y-px" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                  <Save size={14} />
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
