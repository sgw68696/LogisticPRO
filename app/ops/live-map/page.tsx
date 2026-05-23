'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockVehicles, mockDrivers, mockShipments } from '@/data/mockData';
import {
  MapPin, Truck, RefreshCw, Navigation,
  Users, Clock, Activity, Target,
} from 'lucide-react';

export default function LiveMapPage() {
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);

  const vehicles = useMemo(() =>
    mockVehicles
      .filter(v => v.status === 'On Route' || v.status === 'Available')
      .map(v => ({
        ...v,
        driver: mockDrivers.find(d => d.id === v.currentDriver),
        shipment: mockShipments.find(s => s.assignedVehicle === v.id && s.status !== 'Delivered' && s.status !== 'Cancelled'),
        lat: 19.0760 + (Math.random() - 0.5) * 0.8,
        lng: 72.8777 + (Math.random() - 0.5) * 0.8,
      })),
  []);

  const onRoute = vehicles.filter(v => v.status === 'On Route');
  const available = vehicles.filter(v => v.status === 'Available');

  const selected = useMemo(() =>
    vehicles.find(v => v.id === activeVehicle),
  [vehicles, activeVehicle]);

  return (
    <PageWrapper
      title="Live Map"
      description="Real-time GPS tracking of fleet vehicles"
      actions={
        <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> On Route ({onRoute.length})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Available ({available.length})</span>
        </div>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Vehicles" value={vehicles.length} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="On Route" value={onRoute.length} icon={<Navigation className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Available" value={available.length} icon={<Target className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Active Drivers" value={vehicles.filter(v => v.driver).length} icon={<Users className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <Card className="lg:col-span-2 bg-card border border-border/60 shadow-soft h-[480px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
          <div className="text-center relative z-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-[0.92rem] font-semibold text-foreground mb-1">Live Map View</p>
            <p className="text-[0.72rem] text-muted-foreground mb-4">Real-time GPS tracking requires map provider integration</p>

            {/* Mini vehicle positions visualization */}
            <div className="relative w-[300px] h-[200px] bg-muted/20 border border-border/40 rounded-xl mx-auto overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
              {/* Grid lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`h${i}`} className="absolute left-0 right-0 border-t border-border/20" style={{ top: `${(i + 1) * 16}%` }} />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-border/20" style={{ left: `${(i + 1) * 16}%` }} />
              ))}
              {/* Vehicle dots */}
              {onRoute.slice(0, 8).map((v, i) => (
                <button key={v.id} onClick={() => setActiveVehicle(v.id)}
                  className="absolute w-3 h-3 rounded-full bg-cyan-400 border-2 border-background shadow-lg hover:scale-150 transition-transform"
                  style={{
                    left: `${15 + (i % 4) * 22}%`,
                    top: `${15 + Math.floor(i / 4) * 50}%`,
                    opacity: activeVehicle === v.id ? 1 : 0.7,
                    zIndex: activeVehicle === v.id ? 10 : 1,
                  }}
                >
                  <span className="absolute -inset-2 rounded-full bg-cyan-400/20 animate-ping" />
                </button>
              ))}
              {available.map((v, i) => (
                <button key={v.id} onClick={() => setActiveVehicle(v.id)}
                  className="absolute w-3 h-3 rounded-full bg-success border-2 border-background shadow-lg hover:scale-150 transition-transform"
                  style={{
                    left: `${50 + i * 15}%`,
                    top: '70%',
                    opacity: activeVehicle === v.id ? 1 : 0.7,
                  }}
                />
              ))}
            </div>

            <p className="text-[0.65rem] text-muted-foreground">
              <span className="text-cyan-400 font-bold">●</span> On Route ({onRoute.length}) &nbsp;
              <span className="text-success font-bold">●</span> Available ({available.length})
            </p>
          </div>
        </Card>

        {/* Vehicle List Panel */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-[0.82rem] font-bold font-display">Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[440px] overflow-y-auto">
            {vehicles.length > 0 ? (
              <div className="divide-y divide-border/40">
                {vehicles.map(v => (
                  <button key={v.id} onClick={() => setActiveVehicle(v.id)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/10 ${activeVehicle === v.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.status === 'On Route' ? 'bg-cyan-400' : 'bg-success'} ${v.status === 'On Route' ? 'animate-pulse' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.72rem] font-mono font-semibold text-foreground">{v.registrationNumber}</span>
                          <StatusBadge status={v.status} />
                        </div>
                        <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                          {v.driver?.name || 'No driver'} · {v.make} {v.model}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[0.55rem] text-muted-foreground font-mono">
                          {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                        </p>
                        {v.shipment && (
                          <p className="text-[0.55rem] text-cyan-400 font-medium">{v.shipment.trackingNumber}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-[0.78rem] text-muted-foreground">No vehicles active</div>
            )}
          </CardContent>
          {selected && (
            <div className="border-t border-border/40 p-4 bg-muted/10">
              <p className="text-[0.65rem] font-semibold text-foreground mb-2">Selected: {selected.registrationNumber}</p>
              <div className="space-y-1 text-[0.6rem] text-muted-foreground">
                <p>Driver: {selected.driver?.name || 'Unassigned'}</p>
                <p>Status: {selected.status}</p>
                <p>Fuel: {selected.fuelType}</p>
                {selected.shipment && <p>Job: {selected.shipment.trackingNumber} → {selected.shipment.deliveryAddress?.split(',')[0]}</p>}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
