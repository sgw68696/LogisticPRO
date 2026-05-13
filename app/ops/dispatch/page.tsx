'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockDrivers, mockVehicles, mockShipments } from '@/data/mockData';
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
    'Active': 'bg-green-500/10 text-green-700 border-green-200',
    'On Duty': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'Off Duty': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Suspended': 'bg-red-500/10 text-red-700 border-red-200',
    'Available': 'bg-green-500/10 text-green-700 border-green-200',
    'On Route': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Maintenance': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Inactive': 'bg-gray-500/10 text-gray-700 border-gray-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function DispatchBoardPage() {
  const dispatchData = useMemo(() => {
    return mockDrivers.slice(0, 12).map(driver => {
      const assignedShipments = mockShipments.filter(s => s.assignedDriver === driver.id).length;
      const assignedVehicle = mockVehicles.find(v => v.currentDriver === driver.id);
      return { driver, assignedVehicles: assignedVehicle ? 1 : 0, assignedShipments };
    });
  }, []);

  return (
    <PageWrapper title="Dispatch Board" description="Manage driver assignments and shipment dispatch">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Driver Name</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">License #</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Assigned Vehicles</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Shipments</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatchData.map((item) => (
                <TableRow key={item.driver.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-semibold">{item.driver.name}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm font-mono text-xs">{item.driver.licenseNumber}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(item.driver.status)} border`}>
                      {item.driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{item.assignedVehicles}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{item.assignedShipments}</TableCell>
                  <TableCell className="text-[#94a3b8] text-sm text-xs">{item.driver.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
