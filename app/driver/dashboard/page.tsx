'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { mockDrivers, mockShipments, mockNotifications } from '@/data/mockData';
import {
  Truck, Route, Package, Clock, CheckCircle2,
  AlertTriangle, Star, Phone, MapPin,
  ArrowRight, Bell, Wallet, User,
  Navigation, FileCheck, Power,
  TrendingUp, Calendar,
} from 'lucide-react';

const DRIVER_ID = 'drv-001';

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);

  const driver = useMemo(() => mockDrivers.find(d => d.id === DRIVER_ID)!, []);
  const myShipments = useMemo(() =>
    mockShipments.filter(s => s.assignedDriver === DRIVER_ID),
  []);
  const activeShipments = useMemo(() =>
    myShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled'),
  [myShipments]);
  const completedToday = useMemo(() =>
    myShipments.filter(s => s.status === 'Delivered' &&
      new Date(s.actualDelivery || s.updatedAt).toDateString() === new Date().toDateString()),
  [myShipments]);
  const pendingPickups = useMemo(() =>
    myShipments.filter(s => s.status === 'Pending' || s.status === 'Picked Up'),
  [myShipments]);
  const myNotifications = useMemo(() =>
    mockNotifications.filter(n => !n.read).slice(0, 4),
  []);

  const nextShipment = activeShipments[0];

  return (
    <PageWrapper
      title={`Welcome, ${driver.name.split(' ')[0]}!`}
      description="Your dispatch overview and today's assignments"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-lg px-3 py-1.5">
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-[0.7rem] font-bold text-muted-foreground">{online ? 'Online' : 'Offline'}</span>
            <Switch checked={online} onCheckedChange={setOnline} className="scale-75" />
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-lg px-3 py-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
            <span className="text-[0.7rem] font-bold text-foreground">{driver.rating}</span>
          </div>
        </div>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">Active Jobs</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{activeShipments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">Pending Pickup</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{pendingPickups.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">Done Today</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{completedToday.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">Total Trips</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{driver.totalTrips}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">Rating</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{driver.rating}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Next Job */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Job Card */}
          {nextShipment ? (
            <Card className="bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-primary" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    Current Job
                  </CardTitle>
                  <StatusBadge status={nextShipment.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                    <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">Pickup</p>
                    <p className="text-[0.78rem] font-medium text-foreground">{nextShipment.pickupAddress}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{nextShipment.senderName} · {nextShipment.senderPhone}</p>
                  </div>
                  <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                    <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">Delivery</p>
                    <p className="text-[0.78rem] font-medium text-foreground">{nextShipment.deliveryAddress}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{nextShipment.receiverName} · {nextShipment.receiverPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[0.65rem] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded border border-border/40">
                    {nextShipment.trackingNumber}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {nextShipment.packageWeight}kg · {nextShipment.packageType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gap-1.5 text-xs h-8 text-white"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                    <Navigation className="w-3.5 h-3.5" /> Start Route
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <FileCheck className="w-3.5 h-3.5" /> Mark Picked Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border border-border/60 shadow-soft">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto text-success/50 mb-3" />
                <p className="text-[0.92rem] font-semibold text-foreground">No active jobs</p>
                <p className="text-[0.78rem] text-muted-foreground mt-1">You're all caught up! Waiting for new dispatch.</p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Jobs */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Upcoming Jobs ({activeShipments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeShipments.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {activeShipments.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'Pending' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.72rem] font-mono font-semibold text-foreground">{s.trackingNumber}</span>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[0.6rem] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" />{s.pickupAddress.split(',')[0]}
                          <ArrowRight className="w-2 h-2" />
                          {s.deliveryAddress.split(',')[0]}
                        </div>
                      </div>
                      <span className="text-[0.6rem] text-muted-foreground flex-shrink-0">{s.packageWeight}kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[0.72rem] text-muted-foreground">No upcoming jobs.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Profile + Notifications */}
        <div className="space-y-6">
          {/* Driver Profile Card */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-[0.92rem] font-bold font-display text-foreground">{driver.name}</h3>
              <p className="text-[0.7rem] text-muted-foreground mt-0.5">{driver.driverId} · {driver.licenseNumber}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(driver.rating) ? 'text-amber-400' : 'text-muted-foreground/20'}`}
                    fill={i < Math.floor(driver.rating) ? 'currentColor' : 'none'} />
                ))}
                <span className="text-[0.65rem] text-muted-foreground ml-1">{driver.rating}</span>
              </div>
              <div className="mt-4 space-y-2 text-left">
                <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                  <Phone className="w-3 h-3" /> {driver.phone}
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                  <Truck className="w-3 h-3" /> Vehicle: {driver.vehicleAssigned || 'Unassigned'}
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                  <Calendar className="w-3 h-3" /> Joined {new Date(driver.joinDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Toggle */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Power className={`w-4 h-4 ${online ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className="text-[0.78rem] font-medium text-foreground">Online Status</span>
                </div>
                <Switch checked={online} onCheckedChange={setOnline} />
              </div>
              <p className="text-[0.65rem] text-muted-foreground mt-1.5">
                {online ? 'You are visible for dispatch assignments' : 'You will not receive new dispatch requests'}
              </p>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Alerts
                </CardTitle>
                <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0.5 h-auto bg-primary/10 text-primary border-primary/20">
                  {myNotifications.length} new
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {myNotifications.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {myNotifications.map(n => (
                    <div key={n.id} className="px-4 py-2.5 hover:bg-muted/10 transition-colors">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${n.type.includes('delay') || n.type.includes('overdue') ? 'text-destructive' : 'text-amber-400'}`} />
                        <div>
                          <p className="text-[0.7rem] font-medium text-foreground">{n.title}</p>
                          <p className="text-[0.6rem] text-muted-foreground">{n.message.substring(0, 60)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-[0.7rem] text-muted-foreground">No new alerts</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
