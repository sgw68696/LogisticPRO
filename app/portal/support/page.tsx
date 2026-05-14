'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  MessageSquare, Search, X, Plus, Clock,
  CheckCircle2, AlertCircle, Loader2, HelpCircle,
  ArrowUp, ChevronDown,
} from 'lucide-react';
import { portalMockTickets } from '@/data/portal-mock-data';
import type { PortalSupportCategory, PortalTicketStatus, PortalSupportPriority } from '@/types/portal';

const STATUS_META: Record<PortalTicketStatus, { pill: string; dot: string }> = {
  Open: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  'In Progress': { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  'Awaiting Info': { pill: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  Resolved: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Closed: { pill: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};

const PRIORITY_COLORS: Record<PortalSupportPriority, string> = {
  Low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Urgent: 'text-destructive bg-destructive/10 border-destructive/20',
};

const CATEGORIES: { label: string; value: PortalSupportCategory | 'All' }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Shipment Issue', value: 'Shipment Issue' },
  { label: 'Billing', value: 'Billing' },
  { label: 'Technical', value: 'Technical' },
  { label: 'General', value: 'General' },
  { label: 'Complaint', value: 'Complaint' },
];

export default function PortalSupportPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = [...portalMockTickets];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(t => t.ticketRef.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') r = r.filter(t => t.status === statusFilter);
    if (categoryFilter !== 'All') r = r.filter(t => t.category === categoryFilter);
    return r.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [search, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: portalMockTickets.length,
    open: portalMockTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
    resolved: portalMockTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
    urgent: portalMockTickets.filter(t => t.priority === 'Urgent').length,
  }), []);

  return (
    <PageWrapper
      title="My Queries"
      description="View and track all your support tickets"
      actions={
        <Link href="/portal/support/new">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 rounded-[10px] gap-2 text-xs h-9">
            <Plus className="w-4 h-4" />
            Raise a Query
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Tickets" value={stats.total} icon={<MessageSquare className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Open" value={stats.open} icon={<Loader2 className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Resolved" value={stats.resolved} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Urgent" value={stats.urgent} icon={<AlertCircle className="w-5 h-5" />} iconColor="red" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search tickets by ref, subject, or description..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {['All', 'Open', 'In Progress', 'Awaiting Info', 'Resolved', 'Closed'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <SkeletonLoader variant="card" count={3} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No tickets found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or raise a new query</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => {
              const meta = STATUS_META[ticket.status];
              const isExpanded = expandedTicket === ticket.id;
              return (
                <div key={ticket.id} className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden hover:border-border transition-all">
                  <button onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)} className="w-full text-left p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[0.65rem] text-muted-foreground">{ticket.ticketRef}</span>
                        <Badge variant="outline" className={`text-[0.55rem] px-1.5 py-0 border ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                        <Badge variant="outline" className={`text-[0.55rem] px-1.5 py-0 border ${meta?.pill || ''}`}>
                          <span className={`w-1 h-1 rounded-full ${meta?.dot || ''} mr-1`} />{ticket.status}
                        </Badge>
                        <Badge variant="outline" className="text-[0.55rem] px-1.5 py-0 bg-muted/20 text-muted-foreground border-border/40">{ticket.category}</Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mt-1">{ticket.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[0.6rem] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Created {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{ticket.messages.length} messages</span>
                      </div>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ArrowUp className="w-4 h-4 text-muted-foreground rotate-180" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/40 px-4 py-3 space-y-3 bg-muted/10">
                      {ticket.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.isStaff ? '' : 'flex-row-reverse'}`}>
                          <div className={`flex-1 max-w-[80%] ${msg.isStaff ? '' : 'text-right'}`}>
                            <div className={`inline-block px-3 py-2 rounded-xl text-xs ${msg.isStaff ? 'bg-primary/10 text-foreground border border-primary/20' : 'bg-muted/30 text-foreground border border-border/40'}`}>
                              <p className="text-[0.6rem] font-semibold mb-0.5 text-muted-foreground">{msg.from}</p>
                              <p>{msg.message}</p>
                            </div>
                            <p className="text-[0.55rem] text-muted-foreground mt-0.5">{new Date(msg.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                      {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                        <div className="pt-2 border-t border-border/40">
                          <textarea placeholder="Type your reply..." rows={2}
                            className="w-full px-3 py-2 text-xs bg-muted/20 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none" />
                          <div className="flex justify-end mt-2">
                            <Button size="sm" className="rounded-[8px] text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white h-8">Send Reply</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </PageWrapper>
  );
}
