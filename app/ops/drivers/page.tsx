'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockDrivers } from '@/data/mockData';
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
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function DriversPage() {
  const displayData = useMemo(() => {
    return mockDrivers.slice(0, 20);
  }, []);

  return (
    <PageWrapper title="Drivers" description="View and manage all drivers">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Name</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">License #</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">License Expiry</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Phone</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Experience</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((driver) => (
                <TableRow key={driver.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-semibold">{driver.name}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm font-mono text-xs">{driver.licenseNumber}</TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {new Date(driver.licenseExpiry).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm text-xs">{driver.phone}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(driver.status)} border`}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">{driver.yearsOfExperience} years</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
