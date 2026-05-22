'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plane,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Trash2,
  X,
  MapPin,
  Timer,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Luggage,
  CalendarDays,
  Navigation,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
type FlightStatus = 'Arrived' | 'Departing' | 'Scheduled' | 'Delayed' | 'Cancelled' | 'In Flight';
type FlightType = 'Arrival' | 'Departure';
type CargoType = 'General' | 'Perishable' | 'Hazmat' | 'Livestock' | 'Express';

interface Flight {
  id: string;
  flight: string;
  airline: string;
  type: FlightType;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  scheduled: string;
  estimated: string;
  status: FlightStatus;
  cargoType: CargoType;
  cargoWeight: string;
  cargoVolume: string;
  passengers: number;
  gate: string;
  aircraft: string;
}

// ─── Status Meta ────────────────────────────────────────────────────────
const STATUS_META: Record<FlightStatus, { pill: string; dot: string }> = {
  Arrived: {
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Departing: {
    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Scheduled: {
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  Delayed: {
    pill: 'bg-destructive/10 text-destructive border-destructive/20',
    dot: 'bg-destructive',
  },
  Cancelled: {
    pill: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
  'In Flight': {
    pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
};

const TYPE_META: Record<CargoType, { pill: string }> = {
  General: { pill: 'bg-muted/30 text-muted-foreground border-border/30' },
  Perishable: { pill: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Hazmat: { pill: 'bg-destructive/10 text-destructive border-destructive/20' },
  Livestock: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  Express: { pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
};

// ─── Mock Data ──────────────────────────────────────────────────────────
const flights: Flight[] = [
  { id: 'FL-001', flight: 'EK-512', airline: 'Emirates SkyCargo', type: 'Arrival', origin: 'Hyderabad', originCode: 'HYD', destination: 'Dubai', destinationCode: 'DXB', scheduled: '2026-05-14 03:30', estimated: '2026-05-14 03:45', status: 'Arrived', cargoType: 'General', cargoWeight: '24,500 kg', cargoVolume: '145 m³', passengers: 0, gate: 'A3', aircraft: 'B777-F' },
  { id: 'FL-002', flight: 'CX-071', airline: 'Cathay Pacific Cargo', type: 'Departure', origin: 'Hong Kong', originCode: 'HKG', destination: 'Chennai', destinationCode: 'MAA', scheduled: '2026-05-14 08:00', estimated: '2026-05-14 08:30', status: 'Departing', cargoType: 'Express', cargoWeight: '32,100 kg', cargoVolume: '210 m³', passengers: 0, gate: 'B7', aircraft: 'B747-8F' },
  { id: 'FL-003', flight: 'QR-8146', airline: 'Qatar Airways Cargo', type: 'Arrival', origin: 'Doha', originCode: 'DOH', destination: 'Mumbai', destinationCode: 'BOM', scheduled: '2026-05-14 11:15', estimated: '2026-05-14 11:15', status: 'Scheduled', cargoType: 'Perishable', cargoWeight: '18,750 kg', cargoVolume: '98 m³', passengers: 0, gate: 'C1', aircraft: 'A330-200F' },
  { id: 'FL-004', flight: 'TK-6190', airline: 'Turkish Cargo', type: 'Departure', origin: 'Istanbul', originCode: 'IST', destination: 'Delhi', destinationCode: 'DEL', scheduled: '2026-05-14 06:30', estimated: '2026-05-14 09:15', status: 'Delayed', cargoType: 'Hazmat', cargoWeight: '15,200 kg', cargoVolume: '82 m³', passengers: 0, gate: 'D4', aircraft: 'A310-300F' },
  { id: 'FL-005', flight: 'SQ-7348', airline: 'Singapore Airlines Cargo', type: 'Arrival', origin: 'Singapore', originCode: 'SIN', destination: 'Bangalore', destinationCode: 'BLR', scheduled: '2026-05-14 14:00', estimated: '2026-05-14 13:50', status: 'In Flight', cargoType: 'General', cargoWeight: '28,400 kg', cargoVolume: '175 m³', passengers: 0, gate: 'A5', aircraft: 'B747-400F' },
  { id: 'FL-006', flight: 'LH-8316', airline: 'Lufthansa Cargo', type: 'Departure', origin: 'Frankfurt', originCode: 'FRA', destination: 'Mumbai', destinationCode: 'BOM', scheduled: '2026-05-14 22:00', estimated: '2026-05-14 22:00', status: 'Scheduled', cargoType: 'Express', cargoWeight: '35,800 kg', cargoVolume: '240 m³', passengers: 0, gate: 'E2', aircraft: 'MD-11F' },
  { id: 'FL-007', flight: 'PO-972', airline: 'Polar Air Cargo', type: 'Departure', origin: 'Cincinnati', originCode: 'CVG', destination: 'Chennai', destinationCode: 'MAA', scheduled: '2026-05-13 23:00', estimated: '2026-05-14 02:30', status: 'In Flight', cargoType: 'Livestock', cargoWeight: '41,500 kg', cargoVolume: '290 m³', passengers: 0, gate: 'F1', aircraft: 'B747-8F' },
  { id: 'FL-008', flight: 'EK-516', airline: 'Emirates SkyCargo', type: 'Arrival', origin: 'Dubai', originCode: 'DXB', destination: 'Hyderabad', destinationCode: 'HYD', scheduled: '2026-05-14 16:45', estimated: '2026-05-14 17:30', status: 'Delayed', cargoType: 'General', cargoWeight: '22,100 kg', cargoVolume: '134 m³', passengers: 0, gate: 'A7', aircraft: 'B777-F' },
  { id: 'FL-009', flight: '3S-510', airline: 'AeroLogic', type: 'Departure', origin: 'Leipzig', originCode: 'LEJ', destination: 'Bangalore', destinationCode: 'BLR', scheduled: '2026-05-15 05:30', estimated: '2026-05-15 05:30', status: 'Scheduled', cargoType: 'General', cargoWeight: '19,300 kg', cargoVolume: '112 m³', passengers: 0, gate: 'C3', aircraft: 'B777-F' },
  { id: 'FL-010', flight: 'CA-1056', airline: 'Air China Cargo', type: 'Arrival', origin: 'Shanghai', originCode: 'PVG', destination: 'Delhi', destinationCode: 'DEL', scheduled: '2026-05-14 09:00', estimated: '2026-05-14 08:40', status: 'Arrived', cargoType: 'Express', cargoWeight: '31,200 kg', cargoVolume: '198 m³', passengers: 0, gate: 'B2', aircraft: 'B777-F' },
];

// ─── Main Page ──────────────────────────────────────────────────────────
export default function PortFlightsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<FlightType | 'All'>('All');
  const [loading, setLoading] = useState(false);

  const airlines = useMemo(() => [...new Set(flights.map(f => f.airline))], []);

  const filtered = useMemo(() => {
    let result = [...flights];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.flight.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(f => f.status === statusFilter);
    }
    if (typeFilter !== 'All') {
      result = result.filter(f => f.type === typeFilter);
    }

    result.sort((a, b) => a.scheduled.localeCompare(b.scheduled));
    return result;
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    arrived: flights.filter(f => f.status === 'Arrived').length,
    departing: flights.filter(f => f.status === 'Departing').length,
    inFlight: flights.filter(f => f.status === 'In Flight').length,
    scheduled: flights.filter(f => f.status === 'Scheduled').length,
    delayed: flights.filter(f => f.status === 'Delayed').length,
    totalCargo: flights.reduce((sum, f) => sum + parseInt(f.cargoWeight.replace(/[^0-9]/g, '')), 0),
  }), []);

  const statusPills: { label: FlightStatus | 'All'; count: number }[] = [
    { label: 'All', count: flights.length },
    { label: 'Arrived', count: stats.arrived },
    { label: 'Departing', count: stats.departing },
    { label: 'In Flight', count: stats.inFlight },
    { label: 'Scheduled', count: stats.scheduled },
    { label: 'Delayed', count: stats.delayed },
  ];

  const typeIcon = (type: FlightType) =>
    type === 'Arrival' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />;

  const typeColor = (type: FlightType) =>
    type === 'Arrival'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-sky-500/10 text-sky-400 border-sky-500/20';

  return (
    <PageWrapper
      title="Flight Schedule"
      description="Track cargo flight arrivals, departures, and real-time status across all carriers"
      actions={
        <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
          <Plane className="w-4 h-4" />
          Schedule Flight
        </Button>
      }
    >
      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Arrived" value={stats.arrived} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Departing" value={stats.departing} icon={<Plane className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Flight" value={stats.inFlight} icon={<Navigation className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Scheduled" value={stats.scheduled} icon={<CalendarDays className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Delayed" value={stats.delayed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" trend={stats.delayed > 0 ? { value: stats.delayed * 100 / flights.length, isPositive: false } : undefined} />
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search flight, airline, origin, or destination..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as FlightType | 'All')}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Arrival">Arrivals</SelectItem>
              <SelectItem value="Departure">Departures</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as FlightStatus] : null;
            return (
              <button
                key={pill.label}
                onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${
                  isActive
                    ? meta
                      ? `${meta.pill} shadow-sm`
                      : 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'
                }`}
              >
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label}
                <span className={`text-[0.65rem] ${isActive ? 'opacity-80' : 'text-muted-foreground/60'}`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {(search || statusFilter !== 'All' || typeFilter !== 'All') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} flight(s) found
          </p>
        )}
      </div>

      {/* ── Flight Cards ──────────────────────────────────────── */}
      {loading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Plane className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No flights found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              {filtered.length} flights
            </span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {(stats.totalCargo / 1000).toFixed(0)}T total cargo
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map(flight => {
              const meta = STATUS_META[flight.status];
              const cargoMeta = TYPE_META[flight.cargoType];
              return (
                <div
                  key={flight.id}
                  className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Type badge + Flight info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor(flight.type)}`}>
                        {typeIcon(flight.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[0.88rem] font-semibold text-foreground">{flight.flight}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {flight.status}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-muted-foreground">{flight.airline}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-right min-w-[80px]">
                        <p className="text-[0.82rem] font-medium text-foreground">{flight.originCode}</p>
                        <p className="text-[0.65rem] text-muted-foreground truncate">{flight.origin}</p>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <div className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                        <div className="w-px h-4 bg-muted-foreground/20" />
                        <div className={`w-2 h-2 rounded-full ${flight.type === 'Arrival' ? 'bg-emerald-400/60' : 'bg-sky-400/60'}`} />
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-[0.82rem] font-medium text-foreground">{flight.destinationCode}</p>
                        <p className="text-[0.65rem] text-muted-foreground truncate">{flight.destination}</p>
                      </div>
                    </div>

                    {/* Times */}
                    <div className="flex items-center gap-4 text-[0.72rem]">
                      <div>
                        <p className="text-muted-foreground">Scheduled</p>
                        <p className="text-foreground font-medium">{flight.scheduled.split(' ')[1]}</p>
                        <p className="text-muted-foreground">{flight.scheduled.split(' ')[0]}</p>
                      </div>
                      {flight.estimated !== flight.scheduled && (
                        <div>
                          <p className="text-muted-foreground">Estimated</p>
                          <p className={`font-medium ${flight.status === 'Delayed' ? 'text-destructive' : 'text-foreground'}`}>
                            {flight.estimated.split(' ')[1]}
                          </p>
                          <p className="text-muted-foreground">{flight.estimated.split(' ')[0]}</p>
                        </div>
                      )}
                    </div>

                    {/* Cargo details */}
                    <div className="flex items-center gap-3 text-[0.72rem] shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-bold border ${cargoMeta.pill}`}>
                        {flight.cargoType}
                      </span>
                      <span className="text-muted-foreground">{flight.cargoWeight}</span>
                      <span className="text-muted-foreground">Gate {flight.gate}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
