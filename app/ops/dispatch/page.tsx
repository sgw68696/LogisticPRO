'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockDrivers, mockVehicles, mockShipments } from '@/data/mockData';
import {
  Search, X, Users, Truck, Phone, Star,
  MapPin, ArrowRight, CheckCircle2,
  Clock, AlertTriangle, RefreshCw, Plus,
} from 'lucide-react';

type TabView = 'drivers' | 'unassigned' | 'assigned';

export default function DispatchBoardPage() {
  const [search, setSearch] = useState('');
  const [tabView, setTabView] = useState<TabView>('drivers');
  const [statusFilter, setStatusFilter] = useState('All');

  const dispatchData = useMemo(() => {
    return mockDrivers.map(driver => {
      const assignedShipments = mockShipments.filter(s => s.assignedDriver === driver.id);
      const assignedVehicle = mockVehicles.find(v => v.currentDriver === driver.id || v.id === assignedShipments[0]?.assignedVehicle);
      return {
        driver,
        vehicle: assignedVehicle || null,
        activeTrips: assignedShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length,
        completedTrips: assignedShipments.filter(s => s.status === 'Delivered').length,
        totalShipments: assignedShipments.length,
        lastStatus: assignedShipments.length > 0 ? assignedShipments[0].status : null,
      };
    });
  }, []);

  const unassignedShipments = useMemo(() =>
    mockShipments.filter(s => !s.assignedDriver && s.status === 'Pending'),
  []);

  const statuses = useMemo(() => {
    const s = new Set(mockDrivers.map(d => d.status));
    return ['All', ...Array.from(s)];
  }, []);

  const filtered = useMemo(() => {
    let data = dispatchData;
    if (tabView === 'unassigned') return [];
    if (tabView === 'assigned') data = data.filter(d => d.totalShipments > 0);
    const q = search.toLowerCase();
    if (q) data = data.filter(d => d.driver.name.toLowerCase().includes(q) || d.driver.phone.includes(q) || d.driver.licenseNumber.toLowerCase().includes(q));
    if (statusFilter !== 'All') data = data.filter(d => d.driver.status === statusFilter);
    return data;
  }, [dispatchData, search, statusFilter, tabView]);

  const columns: Column<typeof dispatchData[0]>[] = [
    {
      key: 'driver',
      header: 'Driver',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.55rem] font-bold">
            {d.driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[0.78rem] font-medium text-foreground">{d.driver.name}</p>
            <div className="flex items-center gap-1.5 text-[0.6rem] text-muted-foreground">
              <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
              {d.driver.rating} · {d.driver.totalTrips} trips
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (d) => <StatusBadge status={d.driver.status} />,
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (d) => d.vehicle
        ? <span className="text-xs font-mono text-muted-foreground">{d.vehicle.registrationNumber}</span>
        : <span className="text-xs text-muted-foreground/50">Unassigned</span>,
    },
    {
      key: 'activeTrips',
      header: 'Active',
      sortable: true,
      render: (d) => <span className="text-xs font-semibold text-foreground">{d.activeTrips}</span>,
    },
    {
      key: 'completedTrips',
      header: 'Done',
      sortable: true,
      render: (d) => <span className="text-xs text-muted-foreground">{d.completedTrips}</span>,
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (d) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3" />
          {d.driver.phone}
        </div>
      ),
    },
  ];

  const driverStatusCounts = useMemo(() => ({
    all: mockDrivers.length,
    available: mockDrivers.filter(d => d.status === 'Available' || d.status === 'On Duty').length,
    onDuty: mockDrivers.filter(d => d.status === 'On Duty').length,
    offDuty: mockDrivers.filter(d => d.status === 'Off Duty').length,
  }), []);

  return (
    <PageWrapper
      title="Dispatch Board"
      description="Manage driver assignments and shipment dispatch in real-time"
      actions={
        <Button size="sm" className="gap-1.5 text-xs h-8 text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus className="w-3.5 h-3.5" /> New Dispatch
        </Button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Drivers" value={driverStatusCounts.all} icon={<Users className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Available for Work" value={driverStatusCounts.available} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="On Duty Now" value={driverStatusCounts.onDuty} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Unassigned Shipments" value={unassignedShipments.length} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
      </div>

      {/* Filter Bar */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['drivers', 'unassigned', 'assigned'] as const).map(t => (
                <button key={t} onClick={() => setTabView(t)}
                  className={`px-3 py-1.5 rounded-lg text-[0.7rem] font-bold border transition-all ${tabView === t ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >
                  {t === 'drivers' ? 'All Drivers' : t === 'unassigned' ? 'Unassigned' : 'Active'}
                </button>
              ))}
            </div>

            {tabView !== 'unassigned' && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg text-[0.7rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {(search || statusFilter !== 'All') && (
              <button onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20"
              ><X size={12} /></button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {tabView === 'unassigned' ? (
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-[0.82rem] font-bold font-display">Unassigned Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {unassignedShipments.length > 0 ? (
              <div className="divide-y divide-border/40">
                {unassignedShipments.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.7rem] font-mono font-semibold text-foreground">{s.trackingNumber}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[0.6rem] text-muted-foreground">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{s.pickupAddress?.split(',')[0] || 'N/A'}</span>
                        <ArrowRight className="w-2 h-2" />
                        <span>{s.deliveryAddress?.split(',')[0] || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[0.6rem] text-muted-foreground">{s.packageWeight}kg</span>
                      <Button size="sm" variant="outline" className="text-[0.6rem] h-7 px-2 gap-1">
                        <Users className="w-3 h-3" /> Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-success/50 mb-2" />
                <p className="text-[0.82rem] text-muted-foreground">All shipments assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          pageSize={15}
          searchKey="driver.name"
          searchPlaceholder="Search drivers..."
          loading={false}
        />
      )}
    </PageWrapper>
  );
}
