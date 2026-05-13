'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { mockShipments, mockInvoices } from '@/data/mockData';

const kpiData = [
  { title: 'Active Shipments', value: '4', icon: <Package className="w-5 h-5" />, trend: { value: 1, isPositive: true }, iconColor: 'cyan' as const },
  { title: 'Delivered This Month', value: '12', icon: <CheckCircle className="w-5 h-5" />, trend: { value: 3, isPositive: true }, iconColor: 'green' as const },
  { title: 'Pending Invoices', value: '2', icon: <FileText className="w-5 h-5" />, trend: { value: 1, isPositive: false }, iconColor: 'amber' as const },
  { title: 'Open Queries', value: '1', icon: <MessageSquare className="w-5 h-5" />, description: 'Awaiting response', iconColor: 'indigo' as const },
];

const recentShipments = mockShipments.slice(0, 4).map((s) => ({
  id: s.trackingNumber,
  route: `${s.pickupAddress.split(',')[0]} → ${s.deliveryAddress.split(',')[0]}`,
  status: s.status,
  eta: new Date(s.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
}));

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  'In Transit': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Out for Delivery': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Picked Up': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const recentInvoices = mockInvoices.slice(0, 4).map((inv) => ({
  no: inv.invoiceId,
  amount: `₹${inv.amount.toLocaleString('en-IN')}`,
  dueDate: new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  status: inv.status,
}));

const invoiceStatusColors: Record<string, string> = {
  Paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  Unpaid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  Cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function CustomerPortalDashboard() {
  return (
    <PageWrapper title="My Dashboard" description="Track your shipments, invoices, and support queries">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            description={kpi.description}
            iconColor={kpi.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              Recent Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">ID</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Route</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentShipments.map((s, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-xs text-foreground font-medium">{s.id}</td>
                      <td className="py-2.5 px-2 text-muted-foreground text-xs max-w-[180px] truncate">{s.route}</td>
                      <td className="py-2.5 px-2">
                        <Badge variant="outline" className={`text-[0.65rem] px-1.5 py-0 border ${statusColors[s.status] || statusColors.Pending}`}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground text-xs">{s.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Invoice No.</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Due Date</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-xs text-foreground font-medium">{inv.no}</td>
                      <td className="py-2.5 px-2 text-right text-foreground font-semibold text-xs">{inv.amount}</td>
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{inv.dueDate}</td>
                      <td className="py-2.5 px-2">
                        <Badge variant="outline" className={`text-[0.65rem] px-1.5 py-0 border ${invoiceStatusColors[inv.status] || invoiceStatusColors.Unpaid}`}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
