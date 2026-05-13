'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
  FileText,
  AlertTriangle,
  Shield,
  Globe,
  UserCheck,
} from 'lucide-react';
import { mockUsers, mockShipments } from '@/data/mockData';

const kpiData = [
  { title: 'Companies Audited', value: '24', icon: <Building2 className="w-5 h-5" />, trend: { value: 4, isPositive: true }, iconColor: 'cyan' as const },
  { title: 'Open Findings', value: '7', icon: <Search className="w-5 h-5" />, trend: { value: 2, isPositive: false }, iconColor: 'amber' as const },
  { title: 'Audit Reports This Month', value: '18', icon: <FileText className="w-5 h-5" />, trend: { value: 12, isPositive: true }, iconColor: 'indigo' as const },
  { title: 'Access Log Alerts', value: '3', icon: <AlertTriangle className="w-5 h-5" />, description: 'Requires review', iconColor: 'red' as const },
];

const recentAuditLogs = mockShipments.slice(0, 5).map((shipment, i) => {
  const user = mockUsers[i % mockUsers.length];
  const actions = ['Viewed Shipment', 'Exported Report', 'Compared Records', 'Generated Summary', 'Accessed Audit Trail'];
  const modules = ['Shipments', 'Dispatches', 'Fleet', 'Warehouse', 'Compliance'];
  return {
    user: user.name,
    action: actions[i],
    module: modules[i],
    timestamp: shipment.updatedAt,
  };
});

const accessAlerts = [
  { user: 'External User', ip: '203.0.113.42', event: 'Failed Login Attempt', severity: 'High' as const },
  { user: 'Unknown Device', ip: '198.51.100.7', event: 'Unauthorized API Access', severity: 'Critical' as const },
  { user: 'Kavya Iyer', ip: '192.168.1.15', event: 'Accessed Sensitive Reports', severity: 'Medium' as const },
  { user: 'System Bot', ip: '10.0.0.88', event: 'Bulk Data Export', severity: 'Low' as const },
];

const severityColor: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function AuditDashboard() {
  return (
    <PageWrapper title="Audit Dashboard" description="Cross-company audit activity and compliance overview">
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
        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Recent Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">User</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Action</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Module</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuditLogs.map((log, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.6rem] font-bold">
                            {log.user.charAt(0)}
                          </div>
                          <span className="text-foreground font-medium">{log.user}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">{log.action}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{log.module}</td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Access Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Recent Access Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#6366f1]/60 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{alert.user}</p>
                      <Badge
                        variant="outline"
                        className={cn("text-[0.65rem] px-1.5 py-0 border", severityColor[alert.severity])}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.event}</p>
                    <p className="text-[0.65rem] text-muted-foreground/60 mt-0.5 font-mono">{alert.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

