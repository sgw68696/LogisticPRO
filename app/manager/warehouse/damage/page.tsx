"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockDamageReports = [
  { id: 'dmg-001', reportNumber: 'DMG-2025-001', shipmentId: 'shp-001', item: 'Electronics Box', quantity: 2, damageType: 'Crushed', severity: 'Medium', reportedBy: 'Sunita Reddy', date: '2025-01-15', status: 'Reported' },
  { id: 'dmg-002', reportNumber: 'DMG-2025-002', shipmentId: 'shp-012', item: 'Pharmaceutical Kit', quantity: 3, damageType: 'Temperature Exceeded', severity: 'High', reportedBy: 'Sunita Reddy', date: '2025-01-13', status: 'Under Review' },
  { id: 'dmg-003', reportNumber: 'DMG-2025-003', shipmentId: 'shp-018', item: 'Auto Parts', quantity: 5, damageType: 'Scratched', severity: 'Low', reportedBy: 'Mohammed Khan', date: '2025-01-12', status: 'Resolved' },
  { id: 'dmg-004', reportNumber: 'DMG-2025-004', shipmentId: 'shp-023', item: 'Food Package', quantity: 8, damageType: 'Water Damage', severity: 'High', reportedBy: 'Sunita Reddy', date: '2025-01-11', status: 'Under Review' },
  { id: 'dmg-005', reportNumber: 'DMG-2025-005', shipmentId: 'shp-030', item: 'Apparel Bundle', quantity: 2, damageType: 'Torn', severity: 'Low', reportedBy: 'Mohammed Khan', date: '2025-01-10', status: 'Resolved' },
];

export default function WarehouseDamage() {
  const columns: Column<typeof mockDamageReports[0]>[] = [
    {
      key: 'reportNumber',
      header: 'Report #',
      render: (item) => item.reportNumber,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'item',
      header: 'Item',
      render: (item) => item.item,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => item.quantity,
    },
    {
      key: 'damageType',
      header: 'Damage Type',
      render: (item) => item.damageType,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item) => {
        const severityColors: Record<string, string> = {
          'Low': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'High': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={severityColors[item.severity] || 'bg-gray-500/10 text-gray-500'}>
            {item.severity}
          </Badge>
        );
      },
    },
    {
      key: 'reportedBy',
      header: 'Reported By',
      render: (item) => item.reportedBy,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Reported': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Under Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Resolved': 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <PageWrapper title="Damage Reports">
      <DataTable
        data={mockDamageReports}
        columns={columns}
        searchPlaceholder="Search damage reports..."
        searchKey="reportNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}
