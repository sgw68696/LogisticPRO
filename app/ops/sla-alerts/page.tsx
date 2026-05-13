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
import { AlertCircle } from 'lucide-react';

export default function SLAAlertsPage() {
  const delayedShipments = useMemo(() => {
    const now = new Date();
    return mockShipments
      .filter(s => {
        const estimatedDate = new Date(s.estimatedDelivery);
        return estimatedDate < now && s.status !== 'Delivered' && s.status !== 'Cancelled';
      })
      .slice(0, 15);
  }, []);

  return (
    <PageWrapper 
      title="SLA Alerts" 
      description={`${delayedShipments.length} shipments with breached SLAs`}
    >
      {delayedShipments.length === 0 ? (
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-[#e0f2fe] font-semibold">All shipments on track!</p>
          <p className="text-[#94a3b8] text-sm mt-2">No SLA breaches detected</p>
        </div>
      ) : (
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Tracking #</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Receiver</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Est. Delivery</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Days Overdue</TableHead>
                  <TableHead className="text-[#94a3b8] text-xs font-semibold">Alert Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayedShipments.map((shipment) => {
                  const estimatedDate = new Date(shipment.estimatedDelivery);
                  const daysOverdue = Math.floor((new Date().getTime() - estimatedDate.getTime()) / (1000 * 60 * 60 * 24));
                  const alertLevel = daysOverdue > 5 ? 'Critical' : daysOverdue > 2 ? 'High' : 'Medium';
                  
                  return (
                    <TableRow key={shipment.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                      <TableCell className="text-[#e0f2fe] text-sm font-mono">{shipment.trackingNumber}</TableCell>
                      <TableCell className="text-[#e0f2fe] text-sm">{shipment.receiverName}</TableCell>
                      <TableCell className="text-[#e0f2fe] text-sm">{shipment.status}</TableCell>
                      <TableCell className="text-[#94a3b8] text-sm">
                        {estimatedDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#e0f2fe] text-sm font-semibold">{daysOverdue} days</TableCell>
                      <TableCell>
                        <Badge className={
                          alertLevel === 'Critical' 
                            ? 'bg-red-500/10 text-red-700 border-red-200'
                            : alertLevel === 'High'
                            ? 'bg-orange-500/10 text-orange-700 border-orange-200'
                            : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                        } style={{ border: '1px solid' }}>
                          {alertLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
