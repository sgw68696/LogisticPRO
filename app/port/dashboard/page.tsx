'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import {
  Ship, Package, Anchor, TrendingUp,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: string) => {
  const statusColorMap: Record<string, string> = {
    'Arrived': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Berthing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'In Port': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'Departed': 'bg-muted/50 text-muted-foreground border-border/40',
    'Unloading': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Loaded': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return statusColorMap[status] || 'bg-muted/50 text-muted-foreground border-border/40';
};

// Static mock data for vessel schedule
const vesselScheduleData = [
  { vesselName: 'MSC Gulsem', imo: '9432156', eta: '2025-01-16', berthNo: 'B-01', status: 'Berthing' },
  { vesselName: 'Ever Given', imo: '9812345', eta: '2025-01-17', berthNo: 'B-02', status: 'In Port' },
  { vesselName: 'Maersk Seatrade', imo: '9234567', eta: '2025-01-18', berthNo: 'B-03', status: 'Unloading' },
  { vesselName: 'ONE Apus', imo: '9654321', eta: '2025-01-19', berthNo: 'B-04', status: 'In Port' },
  { vesselName: 'COSCO Shipping', imo: '9456789', eta: '2025-01-20', berthNo: 'B-05', status: 'Pending' },
];

// Static mock data for container status
const containerStatusData = [
  { containerNo: 'MAEU123456', type: '40ft HC', status: 'Loaded', yardLocation: 'Yard-A-01' },
  { containerNo: 'OOLU789012', type: '20ft', status: 'Unloading', yardLocation: 'Yard-B-02' },
  { containerNo: 'COSCO345678', type: '40ft', status: 'Loaded', yardLocation: 'Yard-C-03' },
  { containerNo: 'APL901234', type: '20ft HC', status: 'Pending', yardLocation: 'Yard-D-01' },
  { containerNo: 'MSC567890', type: '40ft', status: 'Loaded', yardLocation: 'Yard-A-04' },
];

export default function PortDashboard() {
  return (
    <PageWrapper title="Port Dashboard" description="Monitor vessel operations, cargo movements, and port activities">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Vessels Arriving Today"
            value="2"
            icon={<Ship className="w-4 h-4" />}
            trend="Active"
          />
          <KPICard
            label="Cargo Pending Offload"
            value="342"
            icon={<Package className="w-4 h-4" />}
            trend="+18"
          />
          <KPICard
            label="Containers In Port"
            value="1,248"
            icon={<Package className="w-4 h-4" />}
            trend="+42"
          />
          <KPICard
            label="Berths Occupied"
            value="4 / 6"
            icon={<Anchor className="w-4 h-4" />}
            trend="66%"
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vessel Schedule Table */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-soft">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-[0.88rem] font-semibold text-foreground">Vessel Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Vessel Name</TableHead>
                    <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">IMO No.</TableHead>
                    <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">ETA</TableHead>
                    <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Berth</TableHead>
                    <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vesselScheduleData.map((row) => (
                    <TableRow key={row.vesselName} className="border-b border-border/25 hover:bg-primary/[0.03]">
                      <TableCell className="text-[0.82rem] font-semibold text-foreground">{row.vesselName}</TableCell>
                      <TableCell className="text-[0.82rem] text-muted-foreground font-mono">{row.imo}</TableCell>
                      <TableCell className="text-[0.82rem] text-muted-foreground">{row.eta}</TableCell>
                      <TableCell className="text-[0.82rem] text-muted-foreground">{row.berthNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[0.72rem] font-bold ${getStatusColor(row.status)}`}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Container Status List */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-soft">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-[0.88rem] font-semibold text-foreground">Container Status</h3>
            </div>
            <div className="divide-y divide-border/25">
              {containerStatusData.map((row) => (
                <div key={row.containerNo} className="p-4 hover:bg-primary/[0.03] transition-colors duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[0.82rem] font-semibold text-foreground">{row.containerNo}</p>
                      <p className="text-[0.78rem] text-muted-foreground mt-1">{row.type}</p>
                      <p className="text-[0.72rem] text-muted-foreground/60 mt-1">Location: {row.yardLocation}</p>
                    </div>
                    <Badge variant="outline" className={`ml-2 text-[0.72rem] font-bold flex-shrink-0 ${getStatusColor(row.status)}`}>
                      {row.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}