"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockShipments, mockOrders, mockInvoices, mockWarehouses } from '@/data/mockData';
import { Package, ShoppingCart, FileText, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffDashboard() {
  // Filter data for company cmp-001 (staff scope)
  const companyShipments = mockShipments.filter(s => s.id.startsWith('shp-'));
  const companyOrders = mockOrders;
  const companyInvoices = mockInvoices.filter(i => i.id.startsWith('inv-'));
  const companyWarehouses = mockWarehouses;

  // Calculate KPIs
  const totalShipments = companyShipments.length;
  const pendingOrders = companyOrders.filter(o => o.status === 'Draft' || o.status === 'Confirmed').length;
  const openInvoices = companyInvoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;
  const totalWarehouseItems = companyWarehouses.reduce((sum, wh) => sum + wh.currentStock, 0);

  const kpiCards = [
    {
      title: "Total Shipments",
      value: totalShipments.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Open Invoices",
      value: openInvoices.toString(),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Warehouse Items",
      value: totalWarehouseItems.toString(),
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const recentShipmentsColumns: Column<typeof mockShipments[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking Number',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          item.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'senderName',
      header: 'Sender',
      sortable: true,
    },
    {
      key: 'receiverName',
      header: 'Receiver',
      sortable: true,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      render: (item) => new Date(item.estimatedDelivery).toLocaleDateString(),
      sortable: true,
    },
  ];

  const recentOrdersColumns: Column<typeof mockOrders[0]>[] = [
    {
      key: 'orderId',
      header: 'Order Number',
      sortable: true,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          item.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (item) => `₹${item.totalAmount.toLocaleString()}`,
      sortable: true,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <PageWrapper title="Staff Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Shipments */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Shipments</h3>
            <DataTable
              data={companyShipments.slice(0, 5)}
              columns={recentShipmentsColumns}
              searchKey="trackingNumber"
              searchPlaceholder="Search shipments..."
              pageSize={5}
            />
          </div>

          {/* Recent Orders */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <DataTable
              data={companyOrders.slice(0, 5)}
              columns={recentOrdersColumns}
              searchKey="orderId"
              searchPlaceholder="Search orders..."
              pageSize={5}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
