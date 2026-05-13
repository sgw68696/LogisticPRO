'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import {
  Package, TrendingUp, AlertCircle, CheckCircle,
  Truck, MapPin, FileCheck, AlertTriangle,
  FileText, CreditCard, RefreshCcw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockShipments, mockOrders, mockDrivers } from '@/data/mockData';

const getStatusColor = (status: string) => {
  const statusColorMap: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    'Picked Up': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'In Transit': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Out for Delivery': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-green-500/10 text-green-700 border-green-200',
    'Cancelled': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'Failed': 'bg-red-500/10 text-red-700 border-red-200',
    'Overdue': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Unpaid': 'bg-red-500/10 text-red-700 border-red-200',
    'Paid': 'bg-green-500/10 text-green-700 border-green-200',
    'Available': 'bg-green-500/10 text-green-700 border-green-200',
    'On Route': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export default function AgentDashboard() {
  const agentType = useMemo(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.agentType as 'warehouse' | 'driver' | 'finance';
    }
    return 'warehouse';
  }, []);

  const dashboardContent = useMemo(() => {
    if (agentType === 'warehouse') {
      // Warehouse KPIs: GRNs Today, Pending Outbound, Stock Alerts, Damage Reports
      const grnCount = 8; // Mock static count
      const outboundCount = 12; // Mock static count
      const alertCount = 3; // Mock static count
      const damageCount = 2; // Mock static count

      const taskTable = (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent GRNs</h3>
          <div className="border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[rgba(14,165,233,0.05)]">
                <TableRow>
                  <TableHead className="text-[#7dd3fc]">Ref No.</TableHead>
                  <TableHead className="text-[#7dd3fc]">Warehouse</TableHead>
                  <TableHead className="text-[#7dd3fc]">Items</TableHead>
                  <TableHead className="text-[#7dd3fc]">Received By</TableHead>
                  <TableHead className="text-[#7dd3fc]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ref: 'GRN-2025-0521', warehouse: 'Mumbai Central', items: 45, by: 'Rajesh K', status: 'Completed' },
                  { ref: 'GRN-2025-0520', warehouse: 'Delhi North', items: 32, by: 'Priya S', status: 'In Progress' },
                  { ref: 'GRN-2025-0519', warehouse: 'Bangalore East', items: 58, by: 'Amit P', status: 'Completed' },
                  { ref: 'GRN-2025-0518', warehouse: 'Pune West', items: 21, by: 'Sunita R', status: 'Completed' },
                  { ref: 'GRN-2025-0517', warehouse: 'Chennai South', items: 37, by: 'Mohammed K', status: 'Pending' },
                ].map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="text-[#e0f2fe]">{row.ref}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.warehouse}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.items}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.by}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

      return {
        title: 'Warehouse Dashboard',
        kpis: [
          { title: 'GRNs Today', value: grnCount, icon: <Package className="w-5 h-5" />, trend: { value: 2, isPositive: true }, description: undefined },
          { title: 'Pending Outbound', value: outboundCount, icon: <TrendingUp className="w-5 h-5" />, trend: { value: 1, isPositive: true }, description: undefined },
          { title: 'Stock Alerts', value: alertCount, icon: <AlertCircle className="w-5 h-5" />, description: 'Active' },
          { title: 'Damage Reports', value: damageCount, icon: <AlertTriangle className="w-5 h-5" />, trend: { value: 1, isPositive: false }, description: undefined },
        ],
        taskTable,
      };
    }

    if (agentType === 'driver') {
      // Driver KPIs: Today's Trips, KM Driven, Deliveries Completed, Pending PODs
      const todayTrips = 4;
      const kmDriven = 156;
      const deliveries = 18;
      const pendingPods = 2;

      const taskTable = (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Today's Trips</h3>
          <div className="border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[rgba(14,165,233,0.05)]">
                <TableRow>
                  <TableHead className="text-[#7dd3fc]">Trip ID</TableHead>
                  <TableHead className="text-[#7dd3fc]">Route</TableHead>
                  <TableHead className="text-[#7dd3fc]">Vehicle</TableHead>
                  <TableHead className="text-[#7dd3fc]">Departure</TableHead>
                  <TableHead className="text-[#7dd3fc]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 'TRIP-2025-0801', route: 'Mumbai - Pune', vehicle: 'MH-01-AB-4567', dept: '06:30 AM', status: 'In Progress' },
                  { id: 'TRIP-2025-0802', route: 'Mumbai - Nagpur', vehicle: 'MH-02-CD-8901', dept: '07:15 AM', status: 'In Progress' },
                  { id: 'TRIP-2025-0803', route: 'Mumbai - Nashik', vehicle: 'MH-03-EF-2345', dept: '08:00 AM', status: 'In Progress' },
                  { id: 'TRIP-2025-0804', route: 'Mumbai - Aurangabad', vehicle: 'MH-04-GH-6789', dept: '08:45 AM', status: 'Pending' },
                  { id: 'TRIP-2025-0800', route: 'Mumbai - Thane', vehicle: 'MH-05-IJ-0123', dept: '05:30 AM', status: 'Completed' },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-[#e0f2fe]">{row.id}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.route}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.vehicle}</TableCell>
                    <TableCell className="text-[rgba(148,163,184,0.8)]">{row.dept}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

      return {
        title: 'Driver Dashboard',
        kpis: [
          { title: "Today's Trips", value: todayTrips, icon: <Truck className="w-5 h-5" />, trend: { value: 1, isPositive: true }, description: undefined },
          { title: 'KM Driven', value: `${kmDriven} km`, icon: <MapPin className="w-5 h-5" />, description: 'Active' },
          { title: 'Deliveries Completed', value: deliveries, icon: <CheckCircle className="w-5 h-5" />, trend: { value: 5, isPositive: true }, description: undefined },
          { title: 'Pending PODs', value: pendingPods, icon: <FileCheck className="w-5 h-5" />, trend: { value: 1, isPositive: false }, description: undefined },
        ],
        taskTable,
      };
    }

    // Finance
    const invoicesDue = 7;
    const paymentsToday = 4;
    const overdue = 2;
    const reconciledPct = 94;

    const taskTable = (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        <div className="border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-[rgba(14,165,233,0.05)]">
              <TableRow>
                <TableHead className="text-[#7dd3fc]">Invoice No.</TableHead>
                <TableHead className="text-[#7dd3fc]">Customer</TableHead>
                <TableHead className="text-[#7dd3fc]">Amount</TableHead>
                <TableHead className="text-[#7dd3fc]">Due Date</TableHead>
                <TableHead className="text-[#7dd3fc]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { inv: 'INV-2025-001', customer: 'Tech Solutions', amt: '₹45,000', due: '2025-02-15', status: 'Paid' },
                { inv: 'INV-2025-002', customer: 'Global Logistics', amt: '₹72,500', due: '2025-02-20', status: 'Unpaid' },
                { inv: 'INV-2025-003', customer: 'Express Carriers', amt: '₹38,200', due: '2025-02-10', status: 'Overdue' },
                { inv: 'INV-2025-004', customer: 'Prime Distribution', amt: '₹91,800', due: '2025-02-25', status: 'Unpaid' },
                { inv: 'INV-2025-005', customer: 'Fast Forward Ltd', amt: '₹26,500', due: '2025-02-18', status: 'Pending' },
              ].map((row) => (
                <TableRow key={row.inv}>
                  <TableCell className="text-[#e0f2fe]">{row.inv}</TableCell>
                  <TableCell className="text-[rgba(148,163,184,0.8)]">{row.customer}</TableCell>
                  <TableCell className="text-[rgba(148,163,184,0.8)]">{row.amt}</TableCell>
                  <TableCell className="text-[rgba(148,163,184,0.8)]">{row.due}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );

    return {
      title: 'Finance Dashboard',
      kpis: [
        { title: 'Invoices Due', value: invoicesDue, icon: <FileText className="w-5 h-5" />, trend: { value: 1, isPositive: true }, description: undefined },
        { title: 'Payments Received', value: paymentsToday, icon: <CreditCard className="w-5 h-5" />, trend: { value: 2, isPositive: true }, description: undefined },
        { title: 'Overdue Count', value: overdue, icon: <AlertCircle className="w-5 h-5" />, trend: { value: 1, isPositive: false }, description: undefined },
        { title: 'Reconciled %', value: `${reconciledPct}%`, icon: <RefreshCcw className="w-5 h-5" />, trend: { value: 2, isPositive: true }, description: undefined },
      ],
      taskTable,
    };
  }, [agentType]);

  return (
    <PageWrapper title={dashboardContent.title}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardContent.kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={String(kpi.value)}
            icon={kpi.icon}
            trend={kpi.trend}
            description={kpi.description}
          />
        ))}
      </div>

      {dashboardContent.taskTable}
    </PageWrapper>
  );
}
