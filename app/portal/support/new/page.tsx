'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare, ArrowLeft, Send, Loader2, CheckCircle2,
  AlertCircle, Paperclip, X,
} from 'lucide-react';
import type { PortalSupportCategory, PortalSupportPriority } from '@/types/portal';

const CATEGORIES: { label: string; value: PortalSupportCategory }[] = [
  { label: 'Shipment Issue', value: 'Shipment Issue' },
  { label: 'Billing', value: 'Billing' },
  { label: 'Technical', value: 'Technical' },
  { label: 'General', value: 'General' },
  { label: 'Complaint', value: 'Complaint' },
];

const PRIORITIES: { label: string; value: PortalSupportPriority; color: string }[] = [
  { label: 'Low', value: 'Low', color: 'text-slate-400' },
  { label: 'Medium', value: 'Medium', color: 'text-amber-400' },
  { label: 'High', value: 'High', color: 'text-red-400' },
  { label: 'Urgent', value: 'Urgent', color: 'text-destructive' },
];

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    subject: '',
    category: '' as PortalSupportCategory | '',
    priority: '' as PortalSupportPriority | '',
    description: '',
    bookingRef: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.category) errs.category = 'Select a category';
    if (!form.priority) errs.priority = 'Select priority';
    if (!form.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push('/portal/support'), 1500);
    }, 1000);
  };

  if (success) {
    return (
      <PageWrapper title="Raise a Query" description="Submit a new support ticket">
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Ticket Submitted!</h3>
          <p className="text-sm text-muted-foreground">Our support team will get back to you shortly. Redirecting...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Raise a Query"
      description="Submit a new support ticket for any issues or questions"
      actions={
        <Button variant="outline" size="sm" className="rounded-[9px] text-xs gap-1.5" onClick={() => router.push('/portal/support')}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets
        </Button>
      }
    >
      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Ticket Details</h3>
          </div>

          <div>
            <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subject *</label>
            <input value={form.subject} onChange={e => update('subject', e.target.value)}
              placeholder="Brief summary of your issue"
              className={`w-full h-9 px-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all ${errors.subject ? 'border-destructive' : 'border-border/40'}`} />
            {errors.subject && <p className="text-[0.6rem] text-destructive mt-1">{errors.subject}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category *</label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.category ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[0.6rem] text-destructive mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Priority *</label>
              <Select value={form.priority} onValueChange={v => update('priority', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.priority ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">
                    <span className={p.color}>{p.label}</span>
                  </SelectItem>)}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-[0.6rem] text-destructive mt-1">{errors.priority}</p>}
            </div>
          </div>

          <div>
            <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Booking Reference (optional)</label>
            <input value={form.bookingRef} onChange={e => update('bookingRef', e.target.value)}
              placeholder="e.g. BK-2026-00001"
              className="w-full h-9 px-3 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-mono" />
          </div>

          <div>
            <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description *</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={5} placeholder="Describe your issue in detail. Include any relevant information like dates, tracking numbers, etc."
              className={`w-full px-3 py-2 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none ${errors.description ? 'border-destructive' : 'border-border/40'}`} />
            {errors.description && <p className="text-[0.6rem] text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Attachments (optional)</label>
            <div className="border-2 border-dashed border-border/50 rounded-[9px] p-4 text-center hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer">
              <Paperclip className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
              <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5">Max 10MB per file (PDF, JPG, PNG)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={() => router.push('/portal/support')}>Cancel</Button>
          <Button size="sm" className="rounded-[9px] text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-1.5" disabled={submitting} onClick={handleSubmit}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
