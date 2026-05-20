'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { companyService, type CreateCompanyRequest } from '@/services/companyService';
import { organizationService, type SimpleOrganization } from '@/services/organizationService';
import { companyTypeService, type CompanyType } from '@/services/companyTypeService';
import type { Company, CompanyStatus } from '@/data/mockData';
import {
  Search, Plus, SlidersHorizontal, X, Building2, Loader2, Users,
  Eye, Edit, Trash2, Check, AlertCircle,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusBadge = (status: CompanyStatus) => {
  const map: Record<CompanyStatus, string> = {
    Active: 'bg-success/10 text-success border border-success/20',
    Pending: 'bg-warning/10 text-warning border border-warning/20',
    Suspended: 'bg-destructive/10 text-destructive border border-destructive/20',
    Inactive: 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[status] ?? map.Inactive;
};

const statusDot: Record<CompanyStatus, string> = {
  Active: 'bg-success', Pending: 'bg-warning', Suspended: 'bg-destructive', Inactive: 'bg-muted-foreground',
};

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Logistics: 'bg-primary/10 text-primary border border-primary/20',
    Express: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Freight: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Courier: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    Mixed: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  };
  return map[type] ?? 'bg-muted/60 text-muted-foreground border border-border/50';
};

const planBadge = (plan: string) => {
  const map: Record<string, string> = {
    Enterprise: 'bg-primary/10 text-primary border border-primary/20',
    Professional: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Starter: 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[plan] ?? map.Starter;
};

const STATUS_OPTIONS: CompanyStatus[] = ['Active', 'Pending', 'Suspended', 'Inactive'];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [organizations, setOrganizations] = useState<SimpleOrganization[]>([]);
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);

  const [formData, setFormData] = useState<CreateCompanyRequest>({
    organization_id: 0, company_type_id: 0, name: '', email: '', phone: '',
    registration_number: '', tax_id: '', website: '', address_line1: '',
    address_line2: '', city: '', state: '', country: '', postal_code: '',
    subscription_status: 'trial', status: 'pending',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    organizationService.listAll().then(setOrganizations).catch(() => {});
    companyTypeService.listAll().then(setCompanyTypes).catch(() => {});
  }, []);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await companyService.getCompanies(page, 10, {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setCompanies(result.companies);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      showToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, showToast]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleCreate = async () => {
    if (!formData.name || !formData.email) { showToast('Name and email are required', 'error'); return; }
    setActionLoading(true);
    try {
      const result = await companyService.createCompany(formData);
      if (result.success) { showToast('Company created successfully', 'success'); setShowCreateModal(false); resetForm(); fetchCompanies(); }
      else { showToast(result.message || 'Failed to create company', 'error'); }
    } catch { showToast('Failed to create company', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      const result = await companyService.updateCompany(selectedCompany.id, formData);
      if (result.success) { showToast('Company updated successfully', 'success'); setShowEditModal(false); setSelectedCompany(null); resetForm(); fetchCompanies(); }
      else { showToast(result.message || 'Failed to update company', 'error'); }
    } catch { showToast('Failed to update company', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) return;
    setActionLoading(true);
    try {
      const result = await companyService.deleteCompany(company.id);
      if (result.success) { showToast('Company deleted successfully', 'success'); fetchCompanies(); }
      else { showToast(result.message || 'Failed to delete company', 'error'); }
    } catch { showToast('Failed to delete company', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleActivate = async (company: Company) => {
    setActionLoading(true);
    try {
      const result = await companyService.activateCompany(company.id);
      if (result.success) { showToast('Company activated', 'success'); fetchCompanies(); }
      else { showToast(result.message || 'Failed to activate', 'error'); }
    } catch { showToast('Failed to activate', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDeactivate = async (company: Company) => {
    setActionLoading(true);
    try {
      const result = await companyService.deactivateCompany(company.id);
      if (result.success) { showToast('Company deactivated', 'success'); fetchCompanies(); }
      else { showToast(result.message || 'Failed to deactivate', 'error'); }
    } catch { showToast('Failed to deactivate', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async (company: Company) => {
    setActionLoading(true);
    try {
      const result = await companyService.verifyCompany(company.id);
      if (result.success) { showToast('Company verified', 'success'); fetchCompanies(); }
      else { showToast(result.message || 'Failed to verify', 'error'); }
    } catch { showToast('Failed to verify', 'error'); }
    finally { setActionLoading(false); }
  };

  const openEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      organization_id: 1, company_type_id: 1, name: company.name, email: company.email,
      phone: company.phone, registration_number: company.taxId, tax_id: company.taxId,
      website: company.website || '', address_line1: company.registeredAddress,
      address_line2: '', city: company.city, state: company.state,
      country: company.country, postal_code: company.pincode,
      subscription_status: 'trial', status: company.status === 'Active' ? 'active' : 'pending',
    });
    setShowEditModal(true);
  };

  const openView = (company: Company) => { setSelectedCompany(company); setShowViewModal(true); };

  const resetForm = () => setFormData({
    organization_id: 0, company_type_id: 0, name: '', email: '', phone: '',
    registration_number: '', tax_id: '', website: '', address_line1: '',
    address_line2: '', city: '', state: '', country: '', postal_code: '',
    subscription_status: 'trial', status: 'pending',
  });

  const columns: Column<Company>[] = [
    {
      key: 'name', header: 'Company Name', sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight truncate">{item.name}</p>
            <p className="text-[0.70rem] text-muted-foreground/50 mt-0.5 font-mono">{item.taxId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold ${statusBadge(item.status as CompanyStatus)}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[item.status as CompanyStatus]}`} />
          {item.status}
        </span>
      ),
    },
    {
      key: 'businessType', header: 'Business Type',
      render: (item) => (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[0.72rem] font-bold ${typeBadge(item.businessType)}`}>{item.businessType}</span>),
    },
    {
      key: 'contactPerson', header: 'Contact Person',
      render: (item) => (<div><p className="text-[0.82rem] font-medium text-foreground/80 leading-tight">{item.contactPerson}</p><p className="text-[0.70rem] text-muted-foreground/50 mt-0.5">{item.contactPhone}</p></div>),
    },
    {
      key: 'city', header: 'Location',
      render: (item) => (<span className="text-[0.82rem] text-muted-foreground">{item.city}, {item.state}</span>),
    },
    {
      key: 'plan', header: 'Plan',
      render: (item) => (<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold ${planBadge(item.plan)}`}>{item.plan}</span>),
    },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={() => openView(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" disabled={actionLoading}><Trash2 className="w-3.5 h-3.5" /></button>
          {item.status === 'Pending' && (
            <button onClick={() => handleVerify(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-colors" disabled={actionLoading}><Check className="w-3.5 h-3.5" /></button>
          )}
          {item.status === 'Inactive' && (
            <button onClick={() => handleActivate(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-colors" disabled={actionLoading}><Check className="w-3.5 h-3.5" /></button>
          )}
          {item.status === 'Active' && (
            <button onClick={() => handleDeactivate(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors" disabled={actionLoading}><AlertCircle className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Companies Management"
      description="Manage and track all companies on the platform"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] cursor-pointer text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <Plus size={14} />
            New Company
          </button>
        </div>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by name, contact or city..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[170px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>))}
              </SelectContent>
            </Select>
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="w-8 h-8 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-[8px] text-destructive hover:bg-destructive/20 transition-colors duration-150"><X size={13} /></button>
            )}
          </div>
        </div>
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[0.72rem] font-semibold text-primary">
                {statusFilter}
                <button onClick={() => setStatusFilter('all')}><X size={10} /></button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <>
          <DataTable data={companies} columns={columns} onRowClick={(c) => router.push(`/admin/companies/${c.id}`)} emptyMessage="No companies found" />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Previous</button>
              <span className="text-[0.82rem] text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Next</button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <Modal title="Create Company" onClose={() => setShowCreateModal(false)}>
          <CompanyForm formData={formData} setFormData={setFormData} onSubmit={handleCreate} loading={actionLoading} organizations={organizations} companyTypes={companyTypes} />
        </Modal>
      )}

      {showEditModal && selectedCompany && (
        <Modal title="Edit Company" onClose={() => { setShowEditModal(false); setSelectedCompany(null); }}>
          <CompanyForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} loading={actionLoading} organizations={organizations} companyTypes={companyTypes} />
        </Modal>
      )}

      {showEditModal && selectedCompany && (
        <Modal title="Edit Company" onClose={() => { setShowEditModal(false); setSelectedCompany(null); }}>
          <CompanyForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} loading={actionLoading} />
        </Modal>
      )}

      {showViewModal && selectedCompany && (
        <Modal title="Company Details" onClose={() => { setShowViewModal(false); setSelectedCompany(null); }}>
          <ViewCompany company={selectedCompany} />
        </Modal>
      )}
    </PageWrapper>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="text-[1rem] font-bold font-display text-foreground">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CompanyForm({ formData, setFormData, onSubmit, loading, organizations, companyTypes }: { formData: CreateCompanyRequest; setFormData: (d: CreateCompanyRequest) => void; onSubmit: () => void; loading: boolean; organizations: SimpleOrganization[]; companyTypes: CompanyType[] }) {
  const [showUserSection, setShowUserSection] = useState(false);
  const fields: { key: keyof CreateCompanyRequest; label: string; type?: string; required?: boolean }[] = [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone' },
    { key: 'registration_number', label: 'Registration Number' },
    { key: 'tax_id', label: 'Tax ID' },
    { key: 'website', label: 'Website' },
    { key: 'address_line1', label: 'Address Line 1' },
    { key: 'address_line2', label: 'Address Line 2' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'postal_code', label: 'Postal Code' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</label>
            <input type={f.type || 'text'} value={(formData[f.key] as string) || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5" placeholder={f.label} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Organization <span className="text-destructive">*</span></label>
          <select value={formData.organization_id || ''} onChange={e => setFormData({ ...formData, organization_id: parseInt(e.target.value) || 0 })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
            <option value="">Select Organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Company Type <span className="text-destructive">*</span></label>
          <select value={formData.company_type_id || ''} onChange={e => setFormData({ ...formData, company_type_id: parseInt(e.target.value) || 0 })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
            <option value="">Select Company Type</option>
            {companyTypes.map(ct => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Subscription Status</label>
        <select value={formData.subscription_status} onChange={e => setFormData({ ...formData, subscription_status: e.target.value as any })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="border-t border-border/40 pt-4">
        <button type="button" onClick={() => setShowUserSection(!showUserSection)} className="flex items-center gap-2 text-[0.82rem] font-semibold text-primary hover:text-primary/80 transition-colors">
          <Users size={14} />
          {showUserSection ? 'Hide' : 'Add'} Company User
        </button>

        {showUserSection && (
          <div className="mt-4 space-y-4 p-4 bg-muted/20 rounded-xl border border-border/40">
            <p className="text-[0.78rem] text-muted-foreground">Create an admin user for this company. The user will be auto-approved.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">First Name <span className="text-destructive">*</span></label>
                <input type="text" value={formData.user_first_name || ''} onChange={e => setFormData({ ...formData, user_first_name: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="John" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Last Name <span className="text-destructive">*</span></label>
                <input type="text" value={formData.user_last_name || ''} onChange={e => setFormData({ ...formData, user_last_name: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="Doe" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">User Email <span className="text-destructive">*</span></label>
                <input type="email" value={formData.user_email || ''} onChange={e => setFormData({ ...formData, user_email: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Username</label>
                <input type="text" value={formData.user_username || ''} onChange={e => setFormData({ ...formData, user_username: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Password <span className="text-destructive">*</span></label>
                <input type="password" value={formData.user_password || ''} onChange={e => setFormData({ ...formData, user_password: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">User Phone</label>
                <input type="text" value={formData.user_phone || ''} onChange={e => setFormData({ ...formData, user_phone: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Role</label>
                <select value={formData.user_role_slug || 'companyadmin'} onChange={e => setFormData({ ...formData, user_role_slug: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
                  <option value="companyadmin">Company Admin</option>
                  <option value="companyuser">Company User</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Department</label>
                <input type="text" value={formData.user_department || ''} onChange={e => setFormData({ ...formData, user_department: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="Operations" />
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={onSubmit} disabled={loading} className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

function ViewCompany({ company }: { company: Company }) {
  const statusMeta = { pill: statusBadge(company.status as CompanyStatus), dot: statusDot[company.status as CompanyStatus] };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
        <div>
          <h3 className="text-[1rem] font-bold font-display text-foreground">{company.name}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${statusMeta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
            {company.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
        <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground ml-1">{company.email}</span></div>
        <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground ml-1">{company.phone}</span></div>
        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{company.businessType}</span></div>
        <div><span className="text-muted-foreground">Plan:</span> <span className="font-medium text-foreground ml-1">{company.plan}</span></div>
        <div><span className="text-muted-foreground">City:</span> <span className="font-medium text-foreground ml-1">{company.city}</span></div>
        <div><span className="text-muted-foreground">State:</span> <span className="font-medium text-foreground ml-1">{company.state}</span></div>
      </div>
      <div className="border-t border-border/40 pt-3">
        <p className="text-[0.82rem] text-muted-foreground"><span className="font-medium text-foreground">Address:</span> {company.registeredAddress}</p>
      </div>
    </div>
  );
}
