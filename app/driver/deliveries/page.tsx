'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockDrivers, mockShipments } from '@/data/mockData';
import {
  Search, X, Package, MapPin, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, Phone,
  Navigation, FileCheck, User, Box,
  ChevronDown, ChevronRight, Calendar,
  Camera, Signature, Truck,
} from 'lucide-react';

const DRIVER_ID = 'drv-001';

type Step = 'not-started' | 'in-progress' | 'completed';

interface DeliveryFlow {
  shipment: typeof mockShipments[0];
  pickupStep: Step;
  transitStep: Step;
  deliveryStep: Step;
  podStep: Step;
}

export default function DeliveriesPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<Record<string, DeliveryFlow>>({});

  const activeDeliveries = useMemo(() => {
    const shipments = mockShipments.filter(s =>
      s.assignedDriver === DRIVER_ID &&
      s.status !== 'Delivered' && s.status !== 'Cancelled'
    );
    // Init flow state
    const flow: Record<string, DeliveryFlow> = {};
    shipments.forEach(s => {
      flow[s.id] = flowState[s.id] || {
        shipment: s,
        pickupStep: s.status === 'Pending' ? 'not-started' : 'completed',
        transitStep: s.status === 'In Transit' || s.status === 'Out for Delivery' ? 'in-progress' : 'not-started',
        deliveryStep: s.status === 'Out for Delivery' ? 'in-progress' : 'not-started',
        podStep: 'not-started',
      };
    });
    return { shipments, flow };
  }, [flowState]);

  // Use the flow from state if available, otherwise re-compute
  const flowData = useMemo(() => {
    if (Object.keys(flowState).length > 0) return flowState;
    return activeDeliveries.flow;
  }, [flowState, activeDeliveries.flow]);

  const deliveries = useMemo(() => activeDeliveries.shipments, [activeDeliveries.shipments]);

  const filtered = useMemo(() => {
    if (!search) return deliveries;
    const q = search.toLowerCase();
    return deliveries.filter(d =>
      d.trackingNumber.toLowerCase().includes(q) ||
      d.receiverName.toLowerCase().includes(q) ||
      d.deliveryAddress.toLowerCase().includes(q) ||
      d.pickupAddress.toLowerCase().includes(q)
    );
  }, [deliveries, search]);

  const advanceStep = (shipmentId: string, step: keyof DeliveryFlow) => {
    setFlowState(prev => {
      const current = prev[shipmentId] || {
        shipment: deliveries.find(d => d.id === shipmentId)!,
        pickupStep: 'not-started' as Step,
        transitStep: 'not-started' as Step,
        deliveryStep: 'not-started' as Step,
        podStep: 'not-started' as Step,
      };
      const next: Record<string, Step> = {
        'not-started': 'in-progress',
        'in-progress': 'completed',
        'completed': 'completed',
      };
      return {
        ...prev,
        [shipmentId]: { ...current, [step]: next[current[step]] as Step },
      };
    });
  };

  const stepMeta = (step: Step) => {
    switch (step) {
      case 'completed': return { bg: 'bg-success', text: 'text-white', icon: CheckCircle2, label: 'Done' };
      case 'in-progress': return { bg: 'bg-primary', text: 'text-white', icon: Clock, label: 'In Progress' };
      default: return { bg: 'bg-muted/40', text: 'text-muted-foreground', icon: Clock, label: 'Pending' };
    }
  };

  return (
    <PageWrapper title="Current Deliveries" description="Pickup & delivery workflow for today's assignments">
      {/* Filter */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by tracking ID or address..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(shipment => {
            const flow = flowData[shipment.id] || {
              shipment,
              pickupStep: 'not-started' as Step,
              transitStep: 'not-started' as Step,
              deliveryStep: 'not-started' as Step,
              podStep: 'not-started' as Step,
            };
            const expanded = expandedId === shipment.id;
            const steps: { key: keyof DeliveryFlow; label: string; icon: any }[] = [
              { key: 'pickupStep', label: 'Pickup', icon: Box },
              { key: 'transitStep', label: 'In Transit', icon: Truck },
              { key: 'deliveryStep', label: 'Delivery', icon: MapPin },
              { key: 'podStep', label: 'POD', icon: FileCheck },
            ];

            return (
              <Card key={shipment.id} className="bg-card border border-border/60 shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-400" />
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.82rem] font-bold font-display text-foreground font-mono">{shipment.trackingNumber}</span>
                          <StatusBadge status={shipment.status} />
                        </div>
                        <p className="text-[0.65rem] text-muted-foreground mt-0.5">{shipment.receiverName} · {shipment.packageWeight}kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="gap-1.5 text-[0.6rem] h-7 px-2">
                        <Navigation className="w-3 h-3" /> Navigate
                      </Button>
                      <button onClick={() => setExpandedId(expanded ? null : shipment.id)}
                        className="p-1.5 rounded text-muted-foreground hover:bg-muted/30 transition-colors">
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      <span className="truncate">{shipment.pickupAddress.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <MapPin className="w-3 h-3 text-success flex-shrink-0" />
                      <span className="truncate">{shipment.deliveryAddress.split(',')[0]}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{shipment.senderName}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{shipment.senderPhone}</span>
                  </div>

                  {/* Workflow Steps */}
                  <div className="grid grid-cols-4 gap-2">
                    {steps.map(st => {
                      const step = flow[st.key];
                      const meta = stepMeta(step);
                      const Icon = st.icon;
                      return (
                        <button key={st.key} onClick={() => advanceStep(shipment.id, st.key)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${step === 'completed' ? 'bg-success/10 border-success/20' : step === 'in-progress' ? 'bg-primary/10 border-primary/20' : 'bg-muted/20 border-border/40 hover:bg-muted/30'}`}
                        >
                          <Icon className={`w-4 h-4 ${step === 'completed' ? 'text-success' : step === 'in-progress' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-[0.55rem] font-bold ${step === 'completed' ? 'text-success' : step === 'in-progress' ? 'text-primary' : 'text-muted-foreground'}`}>
                            {st.label}
                          </span>
                          <span className={`text-[0.5rem] font-bold px-1 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                          <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Pickup Details</p>
                          <p className="text-[0.7rem] text-foreground">{shipment.pickupAddress}</p>
                          <p className="text-[0.65rem] text-muted-foreground mt-0.5">{shipment.senderName} · {shipment.senderPhone}</p>
                        </div>
                        <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                          <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Delivery Details</p>
                          <p className="text-[0.7rem] text-foreground">{shipment.deliveryAddress}</p>
                          <p className="text-[0.65rem] text-muted-foreground mt-0.5">{shipment.receiverName} · {shipment.receiverPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                        <span>Package: {shipment.packageWeight}kg · {shipment.packageType} · {shipment.packageDimensions}</span>
                      </div>
                      {shipment.notes && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                          <p className="text-[0.6rem] font-bold text-amber-400 uppercase tracking-wide mb-0.5">Notes</p>
                          <p className="text-[0.7rem] text-amber-300/80">{shipment.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="gap-1.5 text-xs h-8"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                          <Camera className="w-3.5 h-3.5" /> Upload POD
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                          <Signature className="w-3.5 h-3.5" /> Get Signature
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-[0.92rem] font-semibold text-foreground">No active deliveries</p>
            <p className="text-[0.78rem] text-muted-foreground mt-1">All shipments delivered. Check back for new assignments.</p>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
