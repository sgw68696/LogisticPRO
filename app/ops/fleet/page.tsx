'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockVehicles } from '@/data/mockData';
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
    'Available': 'bg-green-500/10 text-green-700 border-green-200',
    'On Route': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Maintenance': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Inactive': 'bg-gray-500/10 text-gray-700 border-gray-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function FleetPage() {
  const displayData = useMemo(() => {
    return mockVehicles.slice(0, 15);
  }, []);

  return (
    <PageWrapper title="Fleet" description="View and manage all vehicles">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Registration</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Make & Model</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Year</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Capacity</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Current Driver</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Insurance Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((vehicle) => (
                <TableRow key={vehicle.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-mono">{vehicle.registrationNumber}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">
                    {vehicle.make} {vehicle.model}
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{vehicle.year}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">
                    {vehicle.capacity} {vehicle.capacityUnit}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(vehicle.status)} border`}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {vehicle.currentDriver || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
