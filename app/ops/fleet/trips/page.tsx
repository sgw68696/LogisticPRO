'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockDrivers, mockShipments } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TripHistoryPage() {
  const tripData = useMemo(() => {
    return mockDrivers.slice(0, 12).map(driver => {
      const shipments = mockShipments.filter(s => s.assignedDriver === driver.id);
      const totalTrips = shipments.length;
      const completedTrips = shipments.filter(s => s.status === 'Delivered').length;
      
      return {
        driver,
        totalTrips,
        completedTrips,
        completionRate: totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
        lastTrip: shipments.length > 0 ? new Date(shipments[0].updatedAt).toLocaleDateString() : 'N/A',
      };
    });
  }, []);

  return (
    <PageWrapper title="Trip History" description="View driver trip history and performance">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Driver Name</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Total Trips</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Completed</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Completion Rate</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Last Trip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tripData.map((item) => (
                <TableRow key={item.driver.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm font-semibold">{item.driver.name}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{item.totalTrips}</TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm">{item.completedTrips}</TableCell>
                  <TableCell>
                    <Badge className={
                      item.completionRate >= 80 
                        ? 'bg-green-500/10 text-green-700 border-green-200'
                        : item.completionRate >= 60
                        ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                        : 'bg-orange-500/10 text-orange-700 border-orange-200'
                    } style={{ border: '1px solid' }}>
                      {item.completionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">{item.lastTrip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
