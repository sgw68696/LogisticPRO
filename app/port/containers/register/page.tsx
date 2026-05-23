'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Container, ArrowLeft, Save, CheckCircle2, Loader2,
  Ship, MapPin, Weight, Hash, Building2, FileText,
  Lock, AlertTriangle, Ruler,
} from 'lucide-react';

type ContainerSize = '20ft' | '20ft HC' | '40ft' | '40ft HC' | '45ft';
type ContainerType = 'Dry Van' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'Tank' | 'Pallet Wide';
type ContainerStatus = 'Loaded' | 'Unloading' | 'Stuffed' | 'Empty' | 'On Hold' | 'Released' | 'Damaged';

const SIZES: ContainerSize[] = ['20ft', '20ft HC', '40ft', '40ft HC', '45ft'];
const TYPES: ContainerType[] = ['Dry Van', 'Reefer', 'Open Top', 'Flat Rack', 'Tank', 'Pallet Wide'];
const STATUSES: ContainerStatus[] = ['Loaded', 'Unloading', 'Stuffed', 'Empty', 'On Hold', 'Released', 'Damaged'];
const VESSELS = [
  'CMA CGM ALTAMIRA', 'MSC AURORA', 'MAERSK GUJARAT',
  'EVERGREEN LOTUS', 'COSCO PRIDE', 'EVERGREEN ACE',
  'MSC ZOE', 'OOCL HONG KONG', 'ONE APUS',
];
const OPERATORS = ['DP World', 'PSA International', 'Adani Ports', 'ECT Terminal', 'Yusen Terminals', 'HHLA', 'COSCO Terminal'];
const YARDS = ['Yard-A-01', 'Yard-A-04', 'Yard-B-02', 'Yard-C-03', 'Yard-D-01', 'Yard-D-04', 'Yard-E-01', 'Yard-F-02', 'Yard-G-03', 'Yard-H-01'];

export default function RegisterContainerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    container: '',
    size: '' as ContainerSize | '',
    type: '' as ContainerType | '',
    status: '' as ContainerStatus | '',
    vessel: '',
    voyage: '',
    origin: '',
    destination: '',
    weight: '',
    yard: '',
    seal: '',
    operator: '',
    customsHold: false,
    damage: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.container.trim()) errs.container = 'Container number is required';
    if (!form.size) errs.size = 'Size is required';
    if (!form.type) errs.type = 'Type is required';
    if (!form.status) errs.status = 'Status is required';
    if (!form.vessel.trim()) errs.vessel = 'Vessel is required';
    if (!form.voyage.trim()) errs.voyage = 'Voyage is required';
    if (!form.origin.trim()) errs.origin = 'Origin is required';
    if (!form.destination.trim()) errs.destination = 'Destination is required';
    if (!form.weight.trim()) errs.weight = 'Weight is required';
    if (!form.yard.trim()) errs.yard = 'Yard is required';
    if (!form.operator.trim()) errs.operator = 'Operator is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push('/port/containers');
    }, 1000);
  };

  return (
    <PageWrapper
      title="Register Container"
      description="Enter container details to register a new container in the port system"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-[9px] text-xs gap-1.5" onClick={() => router.push('/port/containers')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <Button
            size="sm"
            className="rounded-[9px] text-xs bg-gradient-to-r from-sky-500 to-indigo-500 text-white gap-1.5 shadow-md"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {submitting ? 'Registering...' : 'Register Container'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Container Identity */}
        <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Container className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Container Identity</h3>
              <p className="text-[11px] text-muted-foreground">Container number, size, type and status</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Container Number *</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.container}
                  onChange={e => update('container', e.target.value.toUpperCase())}
                  placeholder="e.g. MAEU123456"
                  className={`w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-mono ${errors.container ? 'border-destructive' : 'border-border/40'}`}
                />
              </div>
              {errors.container && <p className="text-[10px] text-destructive mt-1">{errors.container}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Size *</label>
              <Select value={form.size} onValueChange={v => update('size', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.size ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.size && <p className="text-[10px] text-destructive mt-1">{errors.size}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Type *</label>
              <Select value={form.type} onValueChange={v => update('type', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.type ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-[10px] text-destructive mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Status *</label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.status ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-[10px] text-destructive mt-1">{errors.status}</p>}
            </div>
          </div>
        </div>

        {/* Voyage Details */}
        <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Ship className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Voyage Details</h3>
              <p className="text-[11px] text-muted-foreground">Vessel, voyage number, origin and destination</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Vessel *</label>
              <Select value={form.vessel} onValueChange={v => update('vessel', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.vessel ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  {VESSELS.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.vessel && <p className="text-[10px] text-destructive mt-1">{errors.vessel}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Voyage *</label>
              <div className="relative">
                <Ship className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.voyage}
                  onChange={e => update('voyage', e.target.value.toUpperCase())}
                  placeholder="e.g. CNYTN-ALT-2026"
                  className={`w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-mono ${errors.voyage ? 'border-destructive' : 'border-border/40'}`}
                />
              </div>
              {errors.voyage && <p className="text-[10px] text-destructive mt-1">{errors.voyage}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Origin *</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.origin}
                  onChange={e => update('origin', e.target.value)}
                  placeholder="e.g. Yantian, CN"
                  className={`w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all ${errors.origin ? 'border-destructive' : 'border-border/40'}`}
                />
              </div>
              {errors.origin && <p className="text-[10px] text-destructive mt-1">{errors.origin}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.destination}
                  onChange={e => update('destination', e.target.value)}
                  placeholder="e.g. Le Havre, FR"
                  className={`w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all ${errors.destination ? 'border-destructive' : 'border-border/40'}`}
                />
              </div>
              {errors.destination && <p className="text-[10px] text-destructive mt-1">{errors.destination}</p>}
            </div>
          </div>
        </div>

        {/* Cargo & Location */}
        <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Weight className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cargo & Location</h3>
              <p className="text-[11px] text-muted-foreground">Weight, yard assignment and operator information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Weight *</label>
              <div className="relative">
                <Weight className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.weight}
                  onChange={e => update('weight', e.target.value)}
                  placeholder="e.g. 26,400 kg"
                  className={`w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all ${errors.weight ? 'border-destructive' : 'border-border/40'}`}
                />
              </div>
              {errors.weight && <p className="text-[10px] text-destructive mt-1">{errors.weight}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Yard *</label>
              <Select value={form.yard} onValueChange={v => update('yard', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.yard ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select yard" />
                </SelectTrigger>
                <SelectContent>
                  {YARDS.map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.yard && <p className="text-[10px] text-destructive mt-1">{errors.yard}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Operator *</label>
              <Select value={form.operator} onValueChange={v => update('operator', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.operator ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.operator && <p className="text-[10px] text-destructive mt-1">{errors.operator}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Seal Number</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={form.seal}
                  onChange={e => update('seal', e.target.value.toUpperCase())}
                  placeholder="e.g. SL-0012345"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-mono"
                />
              </div>
            </div>
          </div>
          {/* Toggles */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/40">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => update('customsHold', !form.customsHold)}
                className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${form.customsHold ? 'bg-amber-500' : 'bg-muted/50 border border-border/50'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.customsHold ? 'left-4' : 'left-0.5'}`} />
              </div>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-foreground">Customs Hold</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => update('damage', !form.damage)}
                className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${form.damage ? 'bg-destructive' : 'bg-muted/50 border border-border/50'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.damage ? 'left-4' : 'left-0.5'}`} />
              </div>
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-foreground">Damage Reported</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Additional Notes</h3>
              <p className="text-[11px] text-muted-foreground">Optional remarks about this container</p>
            </div>
          </div>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Enter any additional notes or remarks..."
            rows={3}
            className="w-full px-3 py-2 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={() => router.push('/port/containers')}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="rounded-[9px] text-xs bg-gradient-to-r from-sky-500 to-indigo-500 text-white gap-1.5 shadow-md"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {submitting ? 'Registering...' : 'Register Container'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
