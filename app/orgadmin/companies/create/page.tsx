'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { COMPANY_OPERATIONAL_TYPES } from '@/types/company-operational-types';
import { Building2, Loader2, Check, AlertCircle, Users, ArrowLeft } from 'lucide-react';

export default function CreateCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!searchParams?.get('id');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', operationalType: '', plan: 'Professional',
    userFirstName: '', userLastName: '', userEmail: '', userPhone: '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      showToast('Company name and email are required', 'error');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    showToast(`Company "${form.name}" created successfully`, 'success');
    setTimeout(() => router.push('/orgadmin/companies'), 1500);
  };

  return (
    <PageWrapper
      title={isEdit ? 'Edit Company' : 'Create Company'}
      description={isEdit ? 'Update company details' : 'Register a new company under your organization'}
      actions={
        <button onClick={() => router.back()} className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-medium text-muted-foreground border border-border/60 hover:bg-muted/40 transition-all">
          <ArrowLeft size={14} />
          Back
        </button>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-5">Company Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {[
              { key: 'name' as const, label: 'Company Name', required: true },
              { key: 'email' as const, label: 'Email', type: 'email', required: true },
              { key: 'phone' as const, label: 'Phone' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5" placeholder={`Enter ${f.label.toLowerCase()}`} />
              </div>
            ))}
            <div>
              <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Operational Type</label>
              <select value={form.operationalType} onChange={(e) => setForm({ ...form, operationalType: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
                <option value="">Standard</option>
                {COMPANY_OPERATIONAL_TYPES.filter((t) => t.slug !== 'standard').map((ct) => (
                  <option key={ct.slug} value={ct.slug}>{ct.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
                <option value="Starter">Starter</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border/40 pt-5">
            <button type="button" onClick={() => {}} className="flex items-center gap-2 text-[0.82rem] font-semibold text-primary hover:text-primary/80 transition-colors mb-4">
              <Users size={14} />
              Add Company Admin User
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'userFirstName' as const, label: 'First Name' },
                { key: 'userLastName' as const, label: 'Last Name' },
                { key: 'userEmail' as const, label: 'Email', type: 'email' },
                { key: 'userPhone' as const, label: 'Phone' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50" placeholder={`Enter ${f.label.toLowerCase()}`} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating...' : isEdit ? 'Update Company' : 'Create Company'}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
