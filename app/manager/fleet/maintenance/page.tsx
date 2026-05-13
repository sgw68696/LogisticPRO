"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockMaintenance = [
  { id: 'mtn-001', vehicleId: 'veh-001', vehiclePlate: 'MH 12 AB 1234', type: 'Regular', description: 'Oil change and brake check', cost: 5000, performedBy: 'Workshop A', date: '2024-12-15', nextDueDate: '2025-03-15', status: 'Completed' },
  { id: 'mtn-002', vehicleId: 'veh-002', vehiclePlate: 'DL 01 CD 5678', type: 'Repair', description: 'Tire replacement', cost: 12000, performedBy: 'TireFix Center', date: '2024-11-20', nextDueDate: '2025-05-20', status: 'Completed' },
  { id: 'mtn-003', vehicleId: 'veh-003', vehiclePlate: 'KA 01 EF 9012', type: 'Emergency', description: 'Engine repair', cost: 25000, performedBy: 'Engine Specialists', date: '2025-01-10', nextDueDate: '2025-04-10', status: 'Completed' },
  { id: 'mtn-004', vehicleId: 'veh-004', vehiclePlate: 'MH 02 GH 3456', type: 'Regular', description: 'Scheduled service', cost: 8000, performedBy: 'Authorized Service Center', date: '2025-01-12', nextDueDate: '2025-04-12', status: 'Completed' },
  { id: 'mtn-005', vehicleId: 'veh-005', vehiclePlate: 'TN 07 IJ 7890', type: 'Regular', description: 'AC repair and filter change', cost: 6500, performedBy: 'Cooling Systems', date: '2025-01-08', nextDueDate: '2025-04-08', status: 'Completed' },
  { id: 'mtn-006', vehicleId: 'veh-001', vehiclePlate: 'MH 12 AB 1234', type: 'Regular', description: 'Next scheduled service', cost: 0, performedBy: 'Pending', date: '2025-03-15', nextDueDate: '2025-06-15', status: 'Scheduled' },
  { id: 'mtn-007', vehicleId: 'veh-002', vehiclePlate: 'DL 01 CD 5678', type: 'Regular', description: 'Next scheduled service', cost: 0, performedBy: 'Pending', date: '2025-05-20', nextDueDate: '2025-08-20', status: 'Scheduled' },
];

export default function FleetMaintenance() {
  const columns: Column<typeof mockMaintenance[0]>[] = [
    {
      key: 'vehiclePlate',
      header: 'Vehicle',
      render: (item) => item.vehiclePlate,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge variant="outline">{item.type}</Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => item.description,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (item) => item.cost > 0 ? `₹${item.cost.toLocaleString()}` : '-',
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      render: (item) => item.performedBy,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'nextDueDate',
      header: 'Next Due',
      render: (item) => new Date(item.nextDueDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Scheduled': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Overdue': 'bg-red-500/10 text-red-500 border-red-500/20',
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
    <PageWrapper title="Maintenance Schedule">
      <DataTable
        data={mockMaintenance}
        columns={columns}
        searchPlaceholder="Search maintenance records..."
        searchKey="vehiclePlate"
        pageSize={10}
      />
    </PageWrapper>
  );
}
