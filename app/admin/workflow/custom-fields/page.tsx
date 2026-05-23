'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Edit, Trash2,
  X, CheckCircle, XCircle, Database,
  Type, Hash, Calendar, List, ToggleLeft,
  FileText, RefreshCw, Globe,
} from 'lucide-react';

type FieldType = 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Boolean' | 'File';
type FieldEntity = 'Shipment' | 'Order' | 'Customer' | 'Driver' | 'Vehicle' | 'Warehouse';
type FieldStatus = 'Active' | 'Inactive';

interface CustomField {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  entity: FieldEntity;
  required: boolean;
  status: FieldStatus;
  description: string;
  defaultValue?: string;
  options?: string[];
  createdAt: string;
}

const MOCK_FIELDS: CustomField[] = [
  { id: 'cf-001', name: 'PO Number', key: 'po_number', type: 'Text', entity: 'Shipment', required: true, status: 'Active', description: 'Purchase order reference number', defaultValue: '', createdAt: '2025-12-01' },
  { id: 'cf-002', name: 'Weight (kg)', key: 'weight_kg', type: 'Number', entity: 'Shipment', required: true, status: 'Active', description: 'Total shipment weight in kilograms', defaultValue: '0', createdAt: '2025-12-01' },
  { id: 'cf-003', name: 'Delivery Window', key: 'delivery_window', type: 'Date', entity: 'Order', required: false, status: 'Active', description: 'Preferred delivery date range', createdAt: '2025-12-05' },
  { id: 'cf-004', name: 'Region', key: 'region', type: 'Dropdown', entity: 'Customer', required: true, status: 'Active', description: 'Customer geographic region', options: ['North', 'South', 'East', 'West', 'Central'], createdAt: '2025-12-10' },
  { id: 'cf-005', name: 'Hazardous Material', key: 'hazmat', type: 'Boolean', entity: 'Shipment', required: true, status: 'Active', description: 'Indicates if shipment contains hazardous materials', defaultValue: 'false', createdAt: '2025-12-15' },
  { id: 'cf-006', name: 'License Number', key: 'license_no', type: 'Text', entity: 'Driver', required: true, status: 'Active', description: 'Commercial driver license number', createdAt: '2026-01-10' },
  { id: 'cf-007', name: 'Fleet Code', key: 'fleet_code', type: 'Text', entity: 'Vehicle', required: false, status: 'Inactive', description: 'Internal fleet classification code', createdAt: '2026-01-15' },
  { id: 'cf-008', name: 'Unload Type', key: 'unload_type', type: 'Dropdown', entity: 'Warehouse', required: true, status: 'Active', description: 'Method of unloading', options: ['Dock', 'Ramp', 'Manual', 'Conveyor'], createdAt: '2026-02-01' },
  { id: 'cf-009', name: 'Rush Order', key: 'rush_order', type: 'Boolean', entity: 'Order', required: false, status: 'Active', description: 'Mark as priority/rush order', defaultValue: 'false', createdAt: '2026-02-10' },
  { id: 'cf-010', name: 'Container Seal No', key: 'seal_no', type: 'Text', entity: 'Shipment', required: false, status: 'Active', description: 'Customs seal number', createdAt: '2026-03-01' },
  { id: 'cf-011', name: 'Shipper Reference', key: 'shipper_ref', type: 'Text', entity: 'Order', required: false, status: 'Active', description: 'Shipper provided reference ID', createdAt: '2026-03-05' },
  { id: 'cf-012', name: 'Temperature Range', key: 'temp_range', type: 'Text', entity: 'Shipment', required: false, status: 'Inactive', description: 'Required temperature range for cold chain', createdAt: '2026-03-10' },
  { id: 'cf-013', name: 'Volume (m³)', key: 'volume_m3', type: 'Number', entity: 'Warehouse', required: false, status: 'Active', description: 'Storage volume in cubic meters', defaultValue: '0', createdAt: '2026-03-15' },
  { id: 'cf-014', name: 'Inspection Date', key: 'inspection_date', type: 'Date', entity: 'Vehicle', required: true, status: 'Active', description: 'Last vehicle inspection date', createdAt: '2026-03-20' },
  { id: 'cf-015', name: 'Delivery Photo', key: 'delivery_photo', type: 'File', entity: 'Order', required: false, status: 'Active', description: 'Proof of delivery photograph', createdAt: '2026-04-01' },
];

const FIELD_TYPE_META: Record<FieldType, { color: string; bg: string; border: string; icon: any }> = {
  Text:     { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    icon: Type },
  Number:   { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    icon: Hash },
  Date:     { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: Calendar },
  Dropdown: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: List },
  Boolean:  { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20', icon: ToggleLeft },
  File:     { color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   icon: FileText },
};

const ENTITY_COLORS: Record<FieldEntity, string> = {
  Shipment:  'text-primary',
  Order:     'text-sky-400',
  Customer:  'text-amber-400',
  Driver:    'text-emerald-400',
  Vehicle:   'text-violet-400',
  Warehouse: 'text-rose-400',
};

const FIELD_TYPES: FieldType[] = ['Text', 'Number', 'Date', 'Dropdown', 'Boolean', 'File'];
const FIELD_ENTITIES: FieldEntity[] = ['Shipment', 'Order', 'Customer', 'Driver', 'Vehicle', 'Warehouse'];

export default function CustomFieldsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FieldType | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<FieldEntity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FieldStatus | 'all'>('all');
  const [fields, setFields] = useState(MOCK_FIELDS);

  const filtered = fields.filter(f => {
    const q = search.toLowerCase();
    const matchQ = f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || f.type === typeFilter;
    const matchEntity = entityFilter === 'all' || f.entity === entityFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchQ && matchType && matchEntity && matchStatus;
  });

  const handleDelete = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const totalActive = fields.filter(f => f.status === 'Active').length;
  const totalRequired = fields.filter(f => f.required).length;
  const typeCount = new Set(fields.map(f => f.type)).size;
  const entityCount = new Set(fields.map(f => f.entity)).size;

  return (
    <PageWrapper
      title="Custom Fields"
      description="Define custom data fields for shipments, orders, customers and more"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          Add Field
        </button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Fields', value: fields.length, sub: `${totalActive} active`, icon: Database, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Field Types', value: typeCount, sub: 'different types', icon: Type, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
          { label: 'Entities Using', value: entityCount, sub: 'entities configured', icon: Globe, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Required Fields', value: totalRequired, sub: 'mandatory fields', icon: CheckCircle, iconCls: 'text-success bg-success/10 border-success/20', pill: 'bg-success/10 text-success border-success/20' },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-5 py-4 shadow-soft flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border ${pill}`}>{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text" placeholder="Search fields..." value={search} onChange={e => setSearch(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...FIELD_TYPES] as const).map(t => {
              const active = typeFilter === t;
              const meta = t !== 'all' ? FIELD_TYPE_META[t] : null;
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${active ? meta ? `${meta.bg} ${meta.color} ${meta.border}` : 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
                >{t === 'all' ? 'All Types' : t}</button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...FIELD_ENTITIES] as const).map(e => {
              const active = entityFilter === e;
              return (
                <button key={e} onClick={() => setEntityFilter(e)}
                  className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
                >{e === 'all' ? 'All Entities' : e}</button>
              );
            })}
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as FieldStatus | 'all')}
            className="h-9 px-3 rounded-lg text-[0.75rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {(search || typeFilter !== 'all' || entityFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setTypeFilter('all'); setEntityFilter('all'); setStatusFilter('all'); }}
              className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-150"
            ><X size={12} /></button>
          )}
        </div>
        {(search || typeFilter !== 'all' || entityFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} field{filtered.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {/* Fields Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(field => {
            const typeMeta = FIELD_TYPE_META[field.type];
            const TypeIcon = typeMeta.icon;
            return (
              <div key={field.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex-shrink-0 border flex items-center justify-center ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-bold font-display text-foreground truncate">{field.name}</h3>
                        <p className="text-[0.65rem] font-mono text-muted-foreground">{field.key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(field.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[0.72rem] text-muted-foreground mb-3 line-clamp-2">{field.description}</p>

                  {/* Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-bold ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}`}>
                      <TypeIcon className="w-2.5 h-2.5" />
                      {field.type}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold bg-muted/40 border border-border/40 ${ENTITY_COLORS[field.entity]}`}>
                      {field.entity}
                    </span>
                    {field.required && (
                      <Badge variant="default" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/20">Required</Badge>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${field.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                      {field.status === 'Active' ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {field.status}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[0.65rem] text-muted-foreground">Created {field.createdAt}</span>
                    {field.options && (
                      <span className="text-[0.65rem] text-muted-foreground">{field.options.length} options</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Database className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No custom fields found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or add a new field</p>
        </div>
      )}
    </PageWrapper>
  );
}
