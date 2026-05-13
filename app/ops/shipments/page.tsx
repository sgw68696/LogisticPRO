'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockShipments } from '@/data/mockData';
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
    'Picked Up': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'In Transit': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Out for Delivery': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-green-500/10 text-green-700 border-green-200',
    'Cancelled': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Failed': 'bg-red-500/10 text-red-700 border-red-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function ShipmentsPage() {
  const displayData = useMemo(() => {
    return mockShipments.slice(0, 20);
  }, []);

  return (
    <PageWrapper title="Shipments" description="View and manage all shipments">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Tracking #</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Sender</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Receiver</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Pickup City</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Delivery City</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Est. Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((shipment) => (
                <TableRow key={shipment.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-mono">{shipment.trackingNumber}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{shipment.senderName}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{shipment.receiverName}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm text-xs">
                    {shipment.pickupAddress.split(',').pop()?.trim() || 'N/A'}
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm text-xs">
                    {shipment.deliveryAddress.split(',').pop()?.trim() || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(shipment.status)} border`}>
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {new Date(shipment.estimatedDelivery).toLocaleDateString()}
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
