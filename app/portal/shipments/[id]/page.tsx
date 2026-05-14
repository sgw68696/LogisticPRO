'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Package, ArrowLeft, MapPin, Clock, CheckCircle2, Truck,
  Phone, Mail, User, Weight, Ruler, FileText, CalendarDays,
  CircleCheck, CircleDot, Navigation, AlertTriangle,
} from 'lucide-react';
import { portalShipments } from '@/data/portal-mock-data';

const STATUS_PILLS: Record<string, string> = {
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Transit': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Out for Delivery': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Picked Up': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PortalShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading] = useState(false);

  const shipment = useMemo(() =>
    portalShipments.find(s => s.id === params.id || s.trackingNumber === params.id),
    [params.id]
  );

  if (loading) return <PageWrapper title="Loading..."><SkeletonLoader variant="card" count={3} /></PageWrapper>;

  if (!shipment) {
    return (
      <PageWrapper title="Shipment Not Found">
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-foreground">Shipment not found</p>
          <Link href="/portal/shipments"><Button variant="outline" size="sm" className="rounded-[9px] text-xs">Back to Shipments</Button></Link>
        </div>
      </PageWrapper>
    );
  }

  const meta = STATUS_PILLS[shipment.status] || STATUS_PILLS.Pending;
  const timelineSteps = ['Order Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];

  return (
    <PageWrapper
      title={`Shipment ${shipment.trackingNumber}`}
      description={`Status: ${shipment.status}`}
      actions={
        <Button variant="outline" size="sm" className="rounded-[9px] text-xs gap-1.5" onClick={() => router.push('/portal/shipments')}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipments
        </Button>
      }
    >
      {/* Status Header */}
      <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-mono">{shipment.trackingNumber}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={`text-[0.65rem] px-2 py-0.5 border ${meta}`}>{shipment.status}</Badge>
                <span className="text-xs text-muted-foreground">{shipment.serviceType}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Estimated Delivery</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {shipment.actualDelivery && (
              <div className="text-right">
                <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Actual Delivery</p>
                <p className="text-sm font-semibold text-emerald-400">
                  {new Date(shipment.actualDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Timeline + Route */}
        <div className="xl:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />
                <div className="space-y-0">
                  {shipment.timeline.map((event, idx) => {
                    const isLast = idx === 0;
                    const done = true;
                    return (
                      <div key={idx} className="relative flex gap-4 pb-5 last:pb-0">
                        <div className="relative z-10 flex-shrink-0 mt-0.5">
                          <div className={`w-[15px] h-[15px] rounded-full flex items-center justify-center ${isLast ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-muted/30 border-border'} border`}>
                            {isLast ? <CircleCheck className="w-2.5 h-2.5 text-emerald-400" /> : <CircleDot className="w-2.5 h-2.5 text-muted-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-semibold ${isLast ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status}</p>
                            <span className="text-[0.55rem] text-muted-foreground whitespace-nowrap">
                              {new Date(event.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[0.65rem] text-muted-foreground mt-0.5">{event.notes}</p>
                          <p className="text-[0.6rem] text-muted-foreground/60 flex items-center gap-1"><MapPin className="w-2 h-2" />{event.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" /> Progress Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, idx) => {
                  const event = shipment.timeline.find(e => e.status === step);
                  const done = !!event;
                  const isCurrent = !done && (idx === 0 || shipment.timeline.some(e => e.status === timelineSteps[idx - 1]));
                  return (
                    <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isCurrent ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-muted/20 border-border/50 text-muted-foreground/40'}`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <CircleDot className="w-4 h-4" />}
                      </div>
                      <span className={`text-[0.55rem] text-center leading-tight max-w-[70px] ${done ? 'text-foreground font-medium' : 'text-muted-foreground/50'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Route */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Route
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Pickup</p>
                  <p className="text-xs text-foreground">{shipment.pickupAddress}</p>
                </div>
              </div>
              <div className="ml-3.5 pl-4 border-l-2 border-dashed border-border/40">
                <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                  <Truck className="w-3 h-3" />
                  <span>{shipment.serviceType} Service</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Delivery</p>
                  <p className="text-xs text-foreground">{shipment.deliveryAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Info */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" /> Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground">Weight</p>
                  <p className="text-xs text-foreground font-medium flex items-center gap-1"><Weight className="w-3 h-3 text-muted-foreground" />{shipment.packageWeight} kg</p>
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground">Dimensions</p>
                  <p className="text-xs text-foreground font-medium flex items-center gap-1"><Ruler className="w-3 h-3 text-muted-foreground" />{shipment.packageDimensions}</p>
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground">Type</p>
                  <p className="text-xs text-foreground font-medium">{shipment.packageType}</p>
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground">Service</p>
                  <p className="text-xs text-foreground font-medium">{shipment.serviceType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sender / Receiver */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">Sender</p>
                <p className="text-xs font-medium text-foreground">{shipment.senderName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[0.65rem] text-muted-foreground">
                  <Phone className="w-2.5 h-2.5" />{shipment.senderPhone}
                </div>
                <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                  <Mail className="w-2.5 h-2.5" />{shipment.senderEmail}
                </div>
              </div>
              <div className="border-t border-border/40 pt-3">
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">Receiver</p>
                <p className="text-xs font-medium text-foreground">{shipment.receiverName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[0.65rem] text-muted-foreground">
                  <Phone className="w-2.5 h-2.5" />{shipment.receiverPhone}
                </div>
                <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                  <Mail className="w-2.5 h-2.5" />{shipment.receiverEmail}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" /> Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-muted-foreground">Created</span>
                <span className="text-xs text-foreground font-medium">{new Date(shipment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-muted-foreground">Estimated Delivery</span>
                <span className="text-xs text-foreground font-medium">{new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              {shipment.actualDelivery && (
                <div className="flex justify-between">
                  <span className="text-[0.6rem] text-muted-foreground">Actual Delivery</span>
                  <span className="text-xs text-emerald-400 font-medium">{new Date(shipment.actualDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {shipment.notes && (
            <Card className="border border-border/60 shadow-soft">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-xs text-muted-foreground">{shipment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
