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
    'Arrived': 'bg-green-500/10 text-green-700 border-green-200',
    'Berthing': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'In Port': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Departed': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Unloading': 'bg-purple-500/10 text-purple-700 border-purple-200',
    'Loaded': 'bg-green-500/10 text-green-700 border-green-200',
    'Pending': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
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
            title="Vessels Arriving Today"
            value="2"
            icon={Ship}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Cargo Pending Offload"
            value="342"
            icon={Package}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
          <KPICard
            title="Containers In Port"
            value="1,248"
            icon={Package}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <KPICard
            title="Berths Occupied"
            value="4 / 6"
            icon={Anchor}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vessel Schedule Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Vessel Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-slate-700">Vessel Name</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">IMO No.</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">ETA</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Berth</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vesselScheduleData.map((row) => (
                    <TableRow key={row.vesselName} className="hover:bg-slate-50">
                      <TableCell className="text-sm font-medium text-slate-900">{row.vesselName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.imo}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.eta}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.berthNo}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(row.status)}`} variant="outline">
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
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Container Status</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {containerStatusData.map((row) => (
                <div key={row.containerNo} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{row.containerNo}</p>
                      <p className="text-xs text-slate-600 mt-1">{row.type}</p>
                      <p className="text-xs text-slate-500 mt-1">Location: {row.yardLocation}</p>
                    </div>
                    <Badge className={`ml-2 text-xs flex-shrink-0 ${getStatusColor(row.status)}`} variant="outline">
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
