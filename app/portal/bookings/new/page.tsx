'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package, ArrowLeft, Send, CheckCircle2, Loader2,
  MapPin, Building2, User, Phone, Weight, Ruler,
  FileText, CreditCard, AlertCircle,
} from 'lucide-react';

const SERVICE_TYPES = ['Express', 'Standard', 'Freight'] as const;
const PACKAGE_TYPES = ['Box', 'Envelope', 'Pallet', 'Crate', 'Tube', 'Other'] as const;

export default function NewBookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    serviceType: '',
    pickupAddress: '',
    pickupContact: '',
    pickupPhone: '',
    deliveryAddress: '',
    deliveryContact: '',
    deliveryPhone: '',
    packageType: '',
    packageWeight: '',
    packageDimensions: '',
    pieces: '1',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.serviceType) errs.serviceType = 'Select service type';
      if (!form.pickupAddress.trim()) errs.pickupAddress = 'Pickup address required';
      if (!form.pickupContact.trim()) errs.pickupContact = 'Contact name required';
      if (!form.pickupPhone.trim()) errs.pickupPhone = 'Contact phone required';
    } else if (s === 2) {
      if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address required';
      if (!form.deliveryContact.trim()) errs.deliveryContact = 'Contact name required';
      if (!form.deliveryPhone.trim()) errs.deliveryPhone = 'Contact phone required';
    } else if (s === 3) {
      if (!form.packageType) errs.packageType = 'Select package type';
      if (!form.packageWeight.trim()) errs.packageWeight = 'Weight required';
      if (!form.pieces.trim()) errs.pieces = 'Number of pieces required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push('/portal/bookings'), 1500);
    }, 1200);
  };

  if (success) {
    return (
      <PageWrapper title="New Booking" description="Create a new shipment booking">
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Booking Submitted!</h3>
          <p className="text-sm text-muted-foreground">Your booking request has been received. Redirecting...</p>
        </div>
      </PageWrapper>
    );
  }

  const inputClass = (field: string) =>
    `w-full h-9 px-2.5 text-xs bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all ${errors[field] ? 'border-destructive' : 'border-border/40'}`;

  return (
    <PageWrapper
      title="New Booking"
      description="Fill in the details to create a new shipment booking"
      actions={
        <Button variant="outline" size="sm" className="rounded-[9px] text-xs gap-1.5" onClick={() => router.push('/portal/bookings')}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
        </Button>
      }
    >
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-emerald-500 text-white' : 'bg-muted/30 text-muted-foreground border border-border/40'}`}>
              {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={`text-[0.65rem] font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Pickup' : s === 2 ? 'Delivery' : 'Cargo'}
            </span>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-emerald-500' : 'bg-border/40'}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Step 1: Pickup */}
        {step === 1 && (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Pickup Details</h3>
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Service Type *</label>
              <Select value={form.serviceType} onValueChange={v => update('serviceType', v)}>
                <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.serviceType ? 'border-destructive' : 'border-border/40'}`}>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(st => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.serviceType && <p className="text-[0.6rem] text-destructive mt-1">{errors.serviceType}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pickup Address *</label>
              <textarea value={form.pickupAddress} onChange={e => update('pickupAddress', e.target.value)} rows={2} placeholder="Enter full pickup address" className={`${inputClass('pickupAddress')} resize-none py-2 h-auto`} />
              {errors.pickupAddress && <p className="text-[0.6rem] text-destructive mt-1">{errors.pickupAddress}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Contact Name *</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.pickupContact} onChange={e => update('pickupContact', e.target.value)} placeholder="Contact person" className={`${inputClass('pickupContact')} pl-8`} />
                </div>
                {errors.pickupContact && <p className="text-[0.6rem] text-destructive mt-1">{errors.pickupContact}</p>}
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Contact Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.pickupPhone} onChange={e => update('pickupPhone', e.target.value)} placeholder="+91 9XXXXXXXX" className={`${inputClass('pickupPhone')} pl-8`} />
                </div>
                {errors.pickupPhone && <p className="text-[0.6rem] text-destructive mt-1">{errors.pickupPhone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery */}
        {step === 2 && (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Delivery Details</h3>
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Delivery Address *</label>
              <textarea value={form.deliveryAddress} onChange={e => update('deliveryAddress', e.target.value)} rows={2} placeholder="Enter full delivery address" className={`${inputClass('deliveryAddress')} resize-none py-2 h-auto`} />
              {errors.deliveryAddress && <p className="text-[0.6rem] text-destructive mt-1">{errors.deliveryAddress}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Contact Name *</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.deliveryContact} onChange={e => update('deliveryContact', e.target.value)} placeholder="Recipient name" className={`${inputClass('deliveryContact')} pl-8`} />
                </div>
                {errors.deliveryContact && <p className="text-[0.6rem] text-destructive mt-1">{errors.deliveryContact}</p>}
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Contact Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.deliveryPhone} onChange={e => update('deliveryPhone', e.target.value)} placeholder="+91 9XXXXXXXX" className={`${inputClass('deliveryPhone')} pl-8`} />
                </div>
                {errors.deliveryPhone && <p className="text-[0.6rem] text-destructive mt-1">{errors.deliveryPhone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cargo */}
        {step === 3 && (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Cargo Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Package Type *</label>
                <Select value={form.packageType} onValueChange={v => update('packageType', v)}>
                  <SelectTrigger className={`h-9 text-xs rounded-[9px] bg-muted/30 ${errors.packageType ? 'border-destructive' : 'border-border/40'}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_TYPES.map(pt => <SelectItem key={pt} value={pt} className="text-xs">{pt}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.packageType && <p className="text-[0.6rem] text-destructive mt-1">{errors.packageType}</p>}
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Weight (kg) *</label>
                <div className="relative">
                  <Weight className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.packageWeight} onChange={e => update('packageWeight', e.target.value)} placeholder="e.g. 12.5" className={`${inputClass('packageWeight')} pl-8`} />
                </div>
                {errors.packageWeight && <p className="text-[0.6rem] text-destructive mt-1">{errors.packageWeight}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Dimensions</label>
                <div className="relative">
                  <Ruler className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.packageDimensions} onChange={e => update('packageDimensions', e.target.value)} placeholder="e.g. 40x30x20 cm" className="w-full h-9 pl-8 pr-3 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pieces *</label>
                <div className="relative">
                  <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={form.pieces} onChange={e => update('pieces', e.target.value)} placeholder="1" className={`${inputClass('pieces')} pl-8`} />
                </div>
                {errors.pieces && <p className="text-[0.6rem] text-destructive mt-1">{errors.pieces}</p>}
              </div>
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="Describe the contents" className="w-full px-3 py-2 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Special Instructions</label>
              <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="Fragile, handle with care, etc." className="w-full px-3 py-2 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none" />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 && <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={prevStep}>Previous</Button>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={() => router.push('/portal/bookings')}>Cancel</Button>
            {step < 3 ? (
              <Button size="sm" className="rounded-[9px] text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={nextStep}>Next</Button>
            ) : (
              <Button size="sm" className="rounded-[9px] text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-1.5" disabled={submitting} onClick={handleSubmit}>
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
