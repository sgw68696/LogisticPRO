"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const mockSLAAlerts = [
  { id: 'sla-001', shipmentId: 'shp-001', trackingNumber: 'LOG-2025-10001', route: 'Mumbai → Delhi', delayHours: 4.5, severity: 'Medium', reason: 'Traffic congestion' },
  { id: 'sla-002', shipmentId: 'shp-008', trackingNumber: 'LOG-2025-10008', route: 'Bangalore → Chennai', delayHours: 12.2, severity: 'High', reason: 'Vehicle breakdown' },
  { id: 'sla-003', shipmentId: 'shp-015', trackingNumber: 'LOG-2025-10015', route: 'Hyderabad → Pune', delayHours: 18.7, severity: 'Critical', reason: 'Weather conditions' },
  { id: 'sla-004', shipmentId: 'shp-022', trackingNumber: 'LOG-2025-10022', route: 'Delhi → Kolkata', delayHours: 3.2, severity: 'Medium', reason: 'Documentation delay' },
  { id: 'sla-005', shipmentId: 'shp-029', trackingNumber: 'LOG-2025-10029', route: 'Mumbai → Bangalore', delayHours: 8.5, severity: 'High', reason: 'Port congestion' },
  { id: 'sla-006', shipmentId: 'shp-036', trackingNumber: 'LOG-2025-10036', route: 'Chennai → Hyderabad', delayHours: 2.1, severity: 'Low', reason: 'Minor delay' },
  { id: 'sla-007', shipmentId: 'shp-043', trackingNumber: 'LOG-2025-10043', route: 'Pune → Delhi', delayHours: 15.3, severity: 'Critical', reason: 'Route diversion' },
];

export default function ManagerSLAAlerts() {
  const columns: Column<typeof mockSLAAlerts[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking #',
      render: (item) => item.trackingNumber,
    },
    {
      key: 'route',
      header: 'Route',
      render: (item) => item.route,
    },
    {
      key: 'delayHours',
      header: 'Delay (hrs)',
      render: (item) => item.delayHours.toFixed(1),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item) => {
        const severityColors: Record<string, string> = {
          'Critical': 'bg-red-500/10 text-red-500 border-red-500/20',
          'High': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          'Medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Low': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
        return (
          <Badge className={severityColors[item.severity] || 'bg-gray-500/10 text-gray-500'}>
            {item.severity}
          </Badge>
        );
      },
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => item.reason,
    },
  ];

  const criticalCount = mockSLAAlerts.filter(a => a.severity === 'Critical').length;
  const highCount = mockSLAAlerts.filter(a => a.severity === 'High').length;

  return (
    <PageWrapper title="SLA Alerts">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Critical Alerts</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
        </div>
        <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">High Priority Alerts</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{highCount}</div>
        </div>
      </div>

      <DataTable
        data={mockSLAAlerts}
        columns={columns}
        searchPlaceholder="Search alerts..."
        searchKey="trackingNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}
