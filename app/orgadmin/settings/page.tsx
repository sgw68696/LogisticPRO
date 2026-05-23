'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Save, Check, AlertCircle } from 'lucide-react';

export default function OrgAdminSettingsPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    orgName: 'Global Logistics Group',
    email: 'admin@globalgroup.com',
    phone: '+91 98765 43200',
    maxCompanies: '20',
    maxUsersPerCompany: '100',
  });

  const handleSave = () => {
    setToast({ message: 'Settings saved successfully', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PageWrapper title="Settings" description="Organization settings and configuration">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-5">Organization Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { key: 'orgName' as const, label: 'Organization Name' },
              { key: 'email' as const, label: 'Email' },
              { key: 'phone' as const, label: 'Phone' },
              { key: 'maxCompanies' as const, label: 'Max Companies' },
              { key: 'maxUsersPerCompany' as const, label: 'Max Users per Company' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">{f.label}</label>
                <input type="text" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5" />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[0.82rem] font-bold text-white transition-all hover:-translate-y-px" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Save size={14} />
            Save Settings
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
