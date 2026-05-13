'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockCargo } from '@/data/mockData';
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
    'Pending': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    'Loaded': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'In Transit': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Delivered': 'bg-green-500/10 text-green-700 border-green-200',
    'Damaged': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Lost': 'bg-red-500/10 text-red-700 border-red-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function ContainerTrackingPage() {
  const displayData = useMemo(() => {
    return mockCargo.slice(0, 15);
  }, []);

  return (
    <PageWrapper title="Container Tracking" description="Track container shipments in real-time">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Cargo ID</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Description</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Type</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Weight</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Shipper</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Current Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((cargo) => (
                <TableRow key={cargo.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-mono">{cargo.cargoNumber}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{cargo.description.substring(0, 30)}...</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{cargo.type}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">
                    {cargo.weight} {cargo.weightUnit}
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm text-xs">{cargo.shipper.name}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(cargo.status)} border`}>
                      {cargo.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {cargo.currentLocation?.port || 'In Transit'}
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
