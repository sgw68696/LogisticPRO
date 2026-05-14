'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  MapPin, Search, X, Package, Truck, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, Navigation,
  Circle, CircleCheck, CircleDot,
} from 'lucide-react';
import { portalMockTrackingEvents, portalMockBookings } from '@/data/portal-mock-data';
import type { PortalTrackingEventType } from '@/types/portal';

const EVENT_ICONS: Record<PortalTrackingEventType, any> = {
  'Order Placed': Package,
  'Pickup Scheduled': Clock,
  'Picked Up': Package,
  'In Transit': Truck,
  'Arrived at Hub': MapPin,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle2,
  'Failed Attempt': AlertTriangle,
  'Exception': AlertTriangle,
};

const EVENT_COLORS: Record<PortalTrackingEventType, string> = {
  'Order Placed': 'text-slate-400',
  'Pickup Scheduled': 'text-amber-400',
  'Picked Up': 'text-cyan-400',
  'In Transit': 'text-blue-400',
  'Arrived at Hub': 'text-indigo-400',
  'Out for Delivery': 'text-amber-400',
  'Delivered': 'text-emerald-400',
  'Failed Attempt': 'text-red-400',
  'Exception': 'text-red-400',
};

export default function PortalTrackingPage() {
  const [search, setSearch] = useState('');
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trackingNumbers = useMemo(() =>
    [...new Set(portalMockTrackingEvents.map(e => e.trackingNumber))], []);

  const events = useMemo(() => {
    if (!selectedTracking) return [];
    return portalMockTrackingEvents
      .filter(e => e.trackingNumber === selectedTracking)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedTracking]);

  const booking = useMemo(() =>
    portalMockBookings.find(b => b.bookingRef === selectedTracking), [selectedTracking]);

  const searchedTrackingNumbers = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return trackingNumbers.filter(t => t.toLowerCase().includes(q));
  }, [search, trackingNumbers]);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      if (trackingNumbers.includes(search)) {
        setSelectedTracking(search);
      } else if (searchedTrackingNumbers.length > 0) {
        setSelectedTracking(searchedTrackingNumbers[0]);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <PageWrapper
      title="Live Tracking"
      description="Track your shipments in real-time with detailed status updates"
    >
      {/* Search */}
      <div className="bg-card border border-border/60 rounded-xl shadow-soft p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Enter tracking number (e.g. BK-2026-00001)..."
              className="w-full h-10 pl-9 pr-3 bg-muted/30 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => { setSearch(''); setSelectedTracking(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Button onClick={handleSearch} className="rounded-[9px] text-xs h-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Track
          </Button>
        </div>
        {/* Quick tracking links */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-[0.65rem] text-muted-foreground mr-1 self-center">Recent:</span>
          {trackingNumbers.slice(0, 4).map(tn => (
            <button key={tn} onClick={() => { setSelectedTracking(tn); setSearch(tn); }}
              className="px-2 py-0.5 rounded-full text-[0.6rem] font-mono bg-muted/20 border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all">
              {tn}
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonLoader variant="card" count={2} />
        : !selectedTracking ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <Navigation className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">Enter a tracking number</p>
            <p className="text-xs text-muted-foreground">Search by booking reference to see real-time tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="xl:col-span-2">
              <Card className="border border-border/60 shadow-soft">
                <CardHeader className="py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Tracking Timeline — <span className="font-mono text-primary">{selectedTracking}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {events.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">No tracking events found</p>
                  ) : (
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />
                      <div className="space-y-0">
                        {events.map((event, idx) => {
                          const Icon = EVENT_ICONS[event.type] || MapPin;
                          const color = EVENT_COLORS[event.type] || 'text-muted-foreground';
                          const isLast = idx === events.length - 1;
                          return (
                            <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
                              <div className="relative z-10 flex-shrink-0 mt-0.5">
                                <div className={`w-[15px] h-[15px] rounded-full flex items-center justify-center ${isLast ? 'bg-emerald-500/20' : 'bg-muted/30'} border ${isLast ? 'border-emerald-500/50' : 'border-border'}`}>
                                  <Icon className={`w-2.5 h-2.5 ${color}`} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[0.78rem] font-semibold text-foreground">{event.type}</p>
                                  <span className="text-[0.6rem] text-muted-foreground whitespace-nowrap">
                                    {new Date(event.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                                <p className="text-[0.65rem] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />{event.location}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shipment Info */}
              {booking && (
                <Card className="border border-border/60 shadow-soft">
                  <CardHeader className="py-4 px-5">
                    <CardTitle className="text-sm font-semibold">Shipment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-3">
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Service</p>
                      <p className="text-xs font-medium text-foreground">{booking.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                      <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 mt-0.5">{booking.status}</Badge>
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Route</p>
                      <p className="text-xs text-foreground flex items-center gap-1 mt-0.5">
                        {booking.pickupAddress.split(',')[0]}
                        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                        {booking.deliveryAddress.split(',')[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Weight</p>
                      <p className="text-xs text-foreground">{booking.packageWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Est. Delivery</p>
                      <p className="text-xs text-foreground">
                        {new Date(booking.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {booking.notes && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
                        <p className="text-xs text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Status Summary */}
              <Card className="border border-border/60 shadow-soft">
                <CardHeader className="py-4 px-5">
                  <CardTitle className="text-sm font-semibold">Progress</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-2">
                    {(['Order Placed', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'] as PortalTrackingEventType[]).map(step => {
                      const done = events.some(e => e.type === step);
                      const Icon = done ? CircleCheck : CircleDot;
                      return (
                        <div key={step} className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${done ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                          <span className={`text-xs ${done ? 'text-foreground font-medium' : 'text-muted-foreground/50'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
    </PageWrapper>
  );
}
