'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import {
  Truck, Users, TrendingUp, AlertCircle,
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
import { mockShipments, mockDrivers, mockVehicles } from '@/data/mockData';

const getStatusColor = (status: string) => {
  const statusColorMap: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    'Picked Up': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'In Transit': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Out for Delivery': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-green-500/10 text-green-700 border-green-200',
    'Cancelled': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Failed': 'bg-red-500/10 text-red-700 border-red-200',
    'Available': 'bg-green-500/10 text-green-700 border-green-200',
    'On Route': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Maintenance': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Inactive': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Active': 'bg-green-500/10 text-green-700 border-green-200',
    'On Duty': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'Off Duty': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Suspended': 'bg-red-500/10 text-red-700 border-red-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function OperationsDashboard() {
  // Calculate KPIs from mockData (scoped to cmp-001)
  const kpis = useMemo(() => {
    const cmp001Shipments = mockShipments.filter(s => true); // mockShipments already have cmp-001
    const cmp001Drivers = mockDrivers.filter(d => true); // mockDrivers already have cmp-001
    const cmp001Vehicles = mockVehicles.filter(v => true); // mockVehicles already have cmp-001

    const pendingDispatches = cmp001Shipments.filter(s => s.status === 'Pending').length;
    const driversAvailable = cmp001Drivers.filter(d => d.status === 'Available' || d.status === 'Off Duty').length;
    const vehiclesInTransit = cmp001Vehicles.filter(v => v.status === 'On Route').length;
    const delayedShipments = cmp001Shipments.filter(s => 
      s.status !== 'Delivered' && s.status !== 'Cancelled' && 
      new Date(s.estimatedDelivery) < new Date()
    ).length;

    return {
      pendingDispatches,
      driversAvailable,
      vehiclesInTransit,
      delayedShipments,
    };
  }, []);

  // Dispatch Queue - top 5 pending shipments with drivers
  const dispatchQueue = useMemo(() => {
    return mockShipments
      .filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled')
      .slice(0, 5)
      .map(shipment => {
        const driver = mockDrivers.find(d => d.id === shipment.assignedDriver);
        const vehicle = mockVehicles.find(v => v.id === shipment.assignedVehicle);
        return { shipment, driver, vehicle };
      });
  }, []);

  // Fleet Status - first 5 vehicles
  const fleetStatus = useMemo(() => {
    return mockVehicles.slice(0, 5);
  }, []);

  return (
    <PageWrapper title="Operations Dashboard" description="Real-time dispatch and fleet status">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pending Dispatches"
          value={kpis.pendingDispatches}
          icon={<Truck className="w-5 h-5" />}
          iconColor="cyan"
        />
        <KPICard
          title="Drivers Available"
          value={kpis.driversAvailable}
          icon={<Users className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Vehicles In Transit"
          value={kpis.vehiclesInTransit}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Delayed Shipments"
          value={kpis.delayedShipments}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dispatch Queue Table */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(14,165,233,0.1)]">
            <h2 className="text-lg font-semibold text-[#e0f2fe]">Dispatch Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Driver</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Vehicle</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Shipment ID</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatchQueue.length > 0 ? (
                  dispatchQueue.map((item, idx) => (
                    <TableRow key={idx} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                      <TableCell className="text-[#e0f2fe] text-sm">
                        {item.driver?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-[#e0f2fe] text-sm">
                        {item.vehicle?.registrationNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-[#e0f2fe] text-sm font-mono text-xs">
                        {item.shipment.id}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(item.shipment.status)} border`}>
                          {item.shipment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[#94a3b8] py-8">
                      No active dispatches
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right: Fleet Status List */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(14,165,233,0.1)]">
            <h2 className="text-lg font-semibold text-[#e0f2fe]">Fleet Status</h2>
          </div>
          <div className="divide-y divide-[rgba(14,165,233,0.1)]">
            {fleetStatus.length > 0 ? (
              fleetStatus.map((vehicle) => (
                <div key={vehicle.id} className="px-6 py-4 hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[#e0f2fe] text-sm font-semibold">{vehicle.registrationNumber}</p>
                      <p className="text-[#94a3b8] text-xs mt-1">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(vehicle.status)} border text-xs`}>
                        {vehicle.status}
                      </Badge>
                      <p className="text-[#94a3b8] text-xs">
                        {vehicle.currentDriver ? 'In Use' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-[#94a3b8]">
                No vehicles available
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
