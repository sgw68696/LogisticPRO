"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockRates = [
  { id: 'rate-001', origin: 'Mumbai', destination: 'Delhi', mode: 'Road', baseRate: 2500, perKg: 15, carrier: 'DHL', validUntil: '2025-12-31' },
  { id: 'rate-002', origin: 'Bangalore', destination: 'Chennai', mode: 'Road', baseRate: 1800, perKg: 12, carrier: 'FedEx', validUntil: '2025-12-31' },
  { id: 'rate-003', origin: 'Mumbai', destination: 'Dubai', mode: 'Air', baseRate: 15000, perKg: 85, carrier: 'Emirates SkyCargo', validUntil: '2025-06-30' },
  { id: 'rate-004', origin: 'Chennai', destination: 'Singapore', mode: 'Sea', baseRate: 8000, perKg: 25, carrier: 'Maersk', validUntil: '2025-12-31' },
  { id: 'rate-005', origin: 'Delhi', destination: 'Kolkata', mode: 'Rail', baseRate: 1200, perKg: 8, carrier: 'Indian Railways', validUntil: '2025-12-31' },
  { id: 'rate-006', origin: 'Hyderabad', destination: 'Pune', mode: 'Road', baseRate: 1600, perKg: 14, carrier: 'BlueDart', validUntil: '2025-12-31' },
  { id: 'rate-007', origin: 'Mumbai', destination: 'London', mode: 'Air', baseRate: 25000, perKg: 120, carrier: 'British Airways', validUntil: '2025-09-30' },
  { id: 'rate-008', origin: 'Chennai', destination: 'Colombo', mode: 'Sea', baseRate: 4500, perKg: 18, carrier: 'MSC', validUntil: '2025-12-31' },
];

export default function RateCards() {
  const columns: Column<typeof mockRates[0]>[] = [
    {
      key: 'origin',
      header: 'Origin',
      render: (item) => item.origin,
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (item) => item.destination,
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (item) => (
        <Badge variant="outline">{item.mode}</Badge>
      ),
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (item) => item.carrier,
    },
    {
      key: 'baseRate',
      header: 'Base Rate',
      render: (item) => `₹${item.baseRate.toLocaleString()}`,
    },
    {
      key: 'perKg',
      header: 'Per KG',
      render: (item) => `₹${item.perKg}/kg`,
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (item) => new Date(item.validUntil).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Rate Cards">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Active Rate Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockRates}
            columns={columns}
            searchPlaceholder="Search rates..."
            searchKey="origin"
            pageSize={10}
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
