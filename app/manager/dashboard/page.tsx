"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockShipments, mockDrivers } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Users, FileText, Truck } from 'lucide-react';

export default function ManagerDashboard() {
  // Filter shipments for cmp-001
  const companyShipments = mockShipments.filter(s => s.id.startsWith('shp-'));
  const activeShipments = companyShipments
    .filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status))
    .slice(0, 6);
  
  const onDutyDrivers = mockDrivers.filter(d => d.status === 'On Duty' || d.status === 'Active').slice(0, 8);
  
  // Calculate KPIs
  const shipmentsThisWeek = companyShipments.filter(s => {
    const createdAt = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).length;
  
  const slaBreachCount = companyShipments.filter(s => {
    if (s.estimatedDelivery && s.actualDelivery) {
      const estimated = new Date(s.estimatedDelivery);
      const actual = new Date(s.actualDelivery);
      return actual > estimated;
    }
    return false;
  }).length;
  
  const driversOnDuty = mockDrivers.filter(d => d.status === 'On Duty').length;
  
  const openOrders = companyShipments.filter(s => s.status === 'Pending').length;
  
  const pendingDispatches = companyShipments.filter(s => s.status === 'Picked Up').length;

  // SLA Alerts - shipments with delays
  const slaAlerts = companyShipments
    .filter(s => {
      if (s.estimatedDelivery && !s.actualDelivery && s.status !== 'Delivered') {
        const estimated = new Date(s.estimatedDelivery);
        const now = new Date();
        const delayHours = (now.getTime() - estimated.getTime()) / (1000 * 60 * 60);
        return delayHours > 2;
      }
      return false;
    })
    .slice(0, 5)
    .map(s => {
      const estimated = new Date(s.estimatedDelivery);
      const now = new Date();
      const delayHours = Math.max(0, (now.getTime() - estimated.getTime()) / (1000 * 60 * 60));
      const severity = delayHours > 12 ? 'Critical' : delayHours > 6 ? 'High' : 'Medium';
      return {
        id: s.id,
        trackingNumber: s.trackingNumber,
        route: `${s.pickupAddress.split(',')[0]} → ${s.deliveryAddress.split(',')[0]}`,
        delayHours: delayHours.toFixed(1),
        severity,
      };
    });

  const shipmentColumns: Column<typeof activeShipments[0]>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (item) => item.id,
    },
    {
      key: 'route',
      header: 'Route',
      render: (item) => `${item.pickupAddress.split(',')[0]} → ${item.deliveryAddress.split(',')[0]}`,
    },
    {
      key: 'assignedVehicle',
      header: 'Carrier',
      render: (item) => item.assignedVehicle || 'Unassigned',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Picked Up': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'In Transit': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Out for Delivery': 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      render: (item) => new Date(item.estimatedDelivery).toLocaleDateString(),
    },
  ];

  const driverColumns: Column<typeof onDutyDrivers[0]>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'vehicleAssigned',
      header: 'Vehicle',
      render: (item) => item.vehicleAssigned || 'Unassigned',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'On Duty': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Active': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Off Duty': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'activeShipment',
      header: 'Active Shipment',
      render: (item) => {
        const activeTrip = item.tripHistory.find(t => t.status === 'In Progress');
        return activeTrip ? activeTrip.shipmentId : 'None';
      },
    },
  ];

  const slaAlertColumns: Column<typeof slaAlerts[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Shipment ID',
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
      render: (item) => item.delayHours,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item) => {
        const severityColors: Record<string, string> = {
          'Critical': 'bg-red-500/10 text-red-500 border-red-500/20',
          'High': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          'Medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };
        return (
          <Badge className={severityColors[item.severity] || 'bg-gray-500/10 text-gray-500'}>
            {item.severity}
          </Badge>
        );
      },
    },
  ];

  return (
    <PageWrapper title="Operations Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shipments This Week</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipmentsThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SLA Breach Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{slaBreachCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drivers On Duty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{driversOnDuty}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending assignment</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dispatches</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{pendingDispatches}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for pickup</p>
          </CardContent>
        </Card>
      </div>

      {/* Three Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shipments */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Active Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={activeShipments}
              columns={shipmentColumns}
              pageSize={6}
              emptyMessage="No active shipments"
            />
          </CardContent>
        </Card>

        {/* Drivers on Duty */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Drivers on Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={onDutyDrivers}
              columns={driverColumns}
              pageSize={8}
              emptyMessage="No drivers on duty"
            />
          </CardContent>
        </Card>

        {/* SLA Alerts */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">SLA Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={slaAlerts}
              columns={slaAlertColumns}
              pageSize={5}
              emptyMessage="No SLA alerts"
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
