"use client";

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockCustomers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, MapPin } from 'lucide-react';

export default function StaffCustomers() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<typeof mockCustomers[0]>[] = [
    {
      key: 'customerId',
      header: 'Customer ID',
      sortable: true,
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.type === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {item.type}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.totalShipments > 50 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.totalShipments > 50 ? 'Active' : 'Regular'}
        </span>
      ),
    },
    {
      key: 'totalShipments',
      header: 'Total Shipments',
      sortable: true,
    },
  ];

  const CustomerCard = ({ customer }: { customer: typeof mockCustomers[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{customer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{customer.customerId}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            customer.type === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {customer.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{customer.city}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm">
            <span className="font-medium">{customer.totalShipments}</span> shipments
          </span>
          {customer.outstandingBalance > 0 && (
            <span className="text-sm text-orange-600">
              ₹{customer.outstandingBalance.toLocaleString()} due
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper 
      title="Customers" 
      description="View customer records and information"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <DataTable
            data={filteredCustomers}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search customers..."
            pageSize={12}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
