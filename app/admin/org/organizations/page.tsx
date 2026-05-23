'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { organizationService, type CreateOrganizationRequest } from '@/services/organizationService';
import type { Organization } from '@/data/mockData';
import {
  Plus, Eye, Edit, Trash2, Search, X,
  Building, MapPin, Users, GitBranch, Loader2, Check, AlertCircle,
} from 'lucide-react';

const TYPE_STYLES: Record<string, string> = {
  Regional: 'bg-primary/10 text-primary border border-primary/20',
  Branch: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Department: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Division: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Active: { pill: 'bg-success/10 text-success border border-success/20', dot: 'bg-success' },
  Pending: { pill: 'bg-warning/10 text-warning border border-warning/20', dot: 'bg-warning' },
  Inactive: { pill: 'bg-muted/50 text-muted-foreground border border-border/40', dot: 'bg-muted-foreground' },
  Suspended: { pill: 'bg-destructive/10 text-destructive border border-destructive/20', dot: 'bg-destructive' },
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '', email: '', phone: '', registration_number: '', tax_id: '',
    website: '', address_line1: '', address_line2: '', city: '', state: '',
    country: '', postal_code: '', subscription_status: 'trial', max_companies: 10,
    max_users_per_company: 50, status: 'pending',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await organizationService.getOrganizations(page, 10, { search });
      setOrganizations(result.organizations);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      showToast('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const result = await organizationService.createOrganization(formData);
      if (result.success) {
        showToast('Organization created successfully', 'success');
        setShowCreateModal(false);
        resetForm();
        fetchOrganizations();
      } else {
        showToast(result.message || 'Failed to create organization', 'error');
      }
    } catch {
      showToast('Failed to create organization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrg) return;
    setActionLoading(true);
    try {
      const result = await organizationService.updateOrganization(selectedOrg.id, formData);
      if (result.success) {
        showToast('Organization updated successfully', 'success');
        setShowEditModal(false);
        setSelectedOrg(null);
        resetForm();
        fetchOrganizations();
      } else {
        showToast(result.message || 'Failed to update organization', 'error');
      }
    } catch {
      showToast('Failed to update organization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;
    setActionLoading(true);
    try {
      const result = await organizationService.deleteOrganization(org.id);
      if (result.success) {
        showToast('Organization deleted successfully', 'success');
        fetchOrganizations();
      } else {
        showToast(result.message || 'Failed to delete organization', 'error');
      }
    } catch {
      showToast('Failed to delete organization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (org: Organization) => {
    setActionLoading(true);
    try {
      const result = await organizationService.activateOrganization(org.id);
      if (result.success) { showToast('Organization activated', 'success'); fetchOrganizations(); }
      else { showToast(result.message || 'Failed to activate', 'error'); }
    } catch { showToast('Failed to activate', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDeactivate = async (org: Organization) => {
    setActionLoading(true);
    try {
      const result = await organizationService.deactivateOrganization(org.id);
      if (result.success) { showToast('Organization deactivated', 'success'); fetchOrganizations(); }
      else { showToast(result.message || 'Failed to deactivate', 'error'); }
    } catch { showToast('Failed to deactivate', 'error'); }
    finally { setActionLoading(false); }
  };

  const openEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name, email: '', phone: '', registration_number: '', tax_id: '',
      website: '', address_line1: org.address, address_line2: '', city: org.city,
      state: org.state, country: '', postal_code: org.pincode,
      subscription_status: 'trial', max_companies: 10, max_users_per_company: 50,
      status: org.status === 'Active' ? 'active' : 'pending',
    });
    setShowEditModal(true);
  };

  const openView = (org: Organization) => { setSelectedOrg(org); setShowViewModal(true); };

  const resetForm = () => setFormData({
    name: '', email: '', phone: '', registration_number: '', tax_id: '',
    website: '', address_line1: '', address_line2: '', city: '', state: '',
    country: '', postal_code: '', subscription_status: 'trial', max_companies: 10,
    max_users_per_company: 50, status: 'pending',
  });

  const filtered = search
    ? organizations
    : organizations;

  return (
    <PageWrapper
      title="Organizations"
      description="Manage organizations across all companies"
      actions={
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] cursor-pointer text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Organization
        </button>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, city or type..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
          />
        </div>
        {search && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {total} result{total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((org) => {
              const typeStyle = TYPE_STYLES[org.type] ?? TYPE_STYLES.Branch;
              const statusMeta = STATUS_STYLES[org.status] ?? STATUS_STYLES.Inactive;
              return (
                <div key={org.id} className="group relative bg-card border border-border/60 rounded-xl p-5 shadow-soft transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-bold font-display text-foreground leading-tight truncate">{org.name}</h3>
                        <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5 font-mono">{org.id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 flex-shrink-0 px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${statusMeta.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {org.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-semibold ${typeStyle}`}>{org.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[0.78rem] text-muted-foreground">{org.city}, {org.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[0.78rem] text-muted-foreground">{org.agentCount} Agent{org.agentCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="border-t border-border/40 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[0.70rem] text-muted-foreground/50 truncate max-w-[55%]">{org.address}</p>
                      <div className="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openView(org)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(org)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(org)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150" disabled={actionLoading}><Trash2 className="w-3.5 h-3.5" /></button>
                        {org.status === 'Inactive' && (
                          <button onClick={() => handleActivate(org)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-colors duration-150" disabled={actionLoading}><Check className="w-3.5 h-3.5" /></button>
                        )}
                        {org.status === 'Active' && (
                          <button onClick={() => handleDeactivate(org)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors duration-150" disabled={actionLoading}><AlertCircle className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Previous</button>
              <span className="text-[0.82rem] text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Next</button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Building className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No organizations found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or add a new organization</p>
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create Organization" onClose={() => setShowCreateModal(false)}>
          <OrganizationForm formData={formData} setFormData={setFormData} onSubmit={handleCreate} loading={actionLoading} />
        </Modal>
      )}

      {showEditModal && selectedOrg && (
        <Modal title="Edit Organization" onClose={() => { setShowEditModal(false); setSelectedOrg(null); }}>
          <OrganizationForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} loading={actionLoading} />
        </Modal>
      )}

      {showViewModal && selectedOrg && (
        <Modal title="Organization Details" onClose={() => { setShowViewModal(false); setSelectedOrg(null); }}>
          <ViewOrganization org={selectedOrg} />
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

function OrganizationForm({ formData, setFormData, onSubmit, loading }: { formData: CreateOrganizationRequest; setFormData: (d: CreateOrganizationRequest) => void; onSubmit: () => void; loading: boolean }) {
  const [showUserSection, setShowUserSection] = useState(false);
  const fields: { key: keyof CreateOrganizationRequest; label: string; type?: string; required?: boolean }[] = [
    { key: 'name', label: 'Organization Name', required: true },
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
          <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'sm:col-span-1' : ''}>
            <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</label>
            <input
              type={f.type || 'text'}
              value={formData[f.key] as string || ''}
              onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
              className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5"
              placeholder={f.label}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Max Companies</label>
          <input type="number" value={formData.max_companies || 10} onChange={e => setFormData({ ...formData, max_companies: parseInt(e.target.value) || 10 })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Max Users per Company</label>
          <input type="number" value={formData.max_users_per_company || 50} onChange={e => setFormData({ ...formData, max_users_per_company: parseInt(e.target.value) || 50 })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" />
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
          {showUserSection ? 'Hide' : 'Add'} Organization User
        </button>

        {showUserSection && (
          <div className="mt-4 space-y-4 p-4 bg-muted/20 rounded-xl border border-border/40">
            <p className="text-[0.78rem] text-muted-foreground">Create an admin user for this organization. The user will require approval before they can login.</p>
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
                <input type="email" value={formData.user_email || ''} onChange={e => setFormData({ ...formData, user_email: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder="john@org.com" />
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
                <select value={formData.user_role_slug || 'organizationuser'} onChange={e => setFormData({ ...formData, user_role_slug: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
                  <option value="organizationuser">Organization User</option>
                  <option value="companyadmin">Company Admin</option>
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

      <div className="flex gap-3 pt-2">
        <button onClick={onSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function ViewOrganization({ org }: { org: Organization }) {
  const statusMeta = STATUS_STYLES[org.status] ?? STATUS_STYLES.Inactive;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Building className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-[1rem] font-bold font-display text-foreground">{org.name}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${statusMeta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
            {org.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{org.type}</span></div>
        <div><span className="text-muted-foreground">City:</span> <span className="font-medium text-foreground ml-1">{org.city}</span></div>
        <div><span className="text-muted-foreground">State:</span> <span className="font-medium text-foreground ml-1">{org.state}</span></div>
        <div><span className="text-muted-foreground">Agents:</span> <span className="font-medium text-foreground ml-1">{org.agentCount}</span></div>
      </div>
      <div className="border-t border-border/40 pt-3">
        <p className="text-[0.82rem] text-muted-foreground"><span className="font-medium text-foreground">Address:</span> {org.address}</p>
      </div>
    </div>
  );
}
