'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Activity, Clock, Shield, AlertTriangle, CheckCircle, Monitor } from 'lucide-react';

const MOCK_ACTIVITY = [
  {
    id: 1,
    user: 'Rajesh Kumar',
    avatar: 'RK',
    role: 'SuperAdmin',
    action: 'Login successful',
    ip: '192.168.1.1',
    device: 'Chrome / Windows',
    location: 'Indore, India',
    timestamp: '2025-01-15T09:30:00Z',
    status: 'success' as const,
  },
  {
    id: 2,
    user: 'Priya Sharma',
    avatar: 'PS',
    role: 'Manager',
    action: 'Login successful',
    ip: '10.0.0.45',
    device: 'Safari / macOS',
    location: 'Bangalore, India',
    timestamp: '2025-01-15T08:45:00Z',
    status: 'success' as const,
  },
  {
    id: 3,
    user: 'Unknown',
    avatar: '??',
    role: '—',
    action: 'Failed login attempt',
    ip: '203.0.113.42',
    device: 'Firefox / Linux',
    location: 'Unknown',
    timestamp: '2025-01-15T08:12:00Z',
    status: 'failed' as const,
  },
  {
    id: 4,
    user: 'Amit Patel',
    avatar: 'AP',
    role: 'Dispatcher',
    action: 'Login successful',
    ip: '172.16.0.12',
    device: 'Chrome / Android',
    location: 'Mumbai, India',
    timestamp: '2025-01-15T07:00:00Z',
    status: 'success' as const,
  },
  {
    id: 5,
    user: 'Unknown',
    avatar: '??',
    role: '—',
    action: 'Failed login attempt',
    ip: '198.51.100.22',
    device: 'Chrome / Windows',
    location: 'Unknown',
    timestamp: '2025-01-14T23:55:00Z',
    status: 'failed' as const,
  },
];

const STATUS_STYLES = {
  success: {
    pill: 'bg-success/10 text-success border border-success/20',
    dot:  'bg-success',
    icon: CheckCircle,
    iconCls: 'text-success',
    rowBg: '',
  },
  failed: {
    pill: 'bg-destructive/10 text-destructive border border-destructive/20',
    dot:  'bg-destructive',
    icon: AlertTriangle,
    iconCls: 'text-destructive',
    rowBg: 'bg-destructive/[0.02]',
  },
};

export default function LoginActivityPage() {
  const successCount = MOCK_ACTIVITY.filter((a) => a.status === 'success').length;
  const failedCount  = MOCK_ACTIVITY.filter((a) => a.status === 'failed').length;

  return (
    <PageWrapper
      title="Login Activity"
      description="Monitor and audit all platform login events"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Events',
            value: MOCK_ACTIVITY.length,
            icon: Activity,
            iconCls: 'text-primary bg-primary/10 border-primary/20',
            pill: 'bg-primary/10 text-primary border-primary/20',
          },
          {
            label: 'Successful Logins',
            value: successCount,
            icon: CheckCircle,
            iconCls: 'text-success bg-success/10 border-success/20',
            pill: 'bg-success/10 text-success border-success/20',
          },
          {
            label: 'Failed Attempts',
            value: failedCount,
            icon: AlertTriangle,
            iconCls: 'text-destructive bg-destructive/10 border-destructive/20',
            pill: 'bg-destructive/10 text-destructive border-destructive/20',
          },
        ].map(({ label, value, icon: Icon, iconCls, pill }) => (
          <div key={label} className="
            bg-card border border-border/60
            rounded-xl px-5 py-4 shadow-soft
            flex items-center gap-4
          ">
            <div className={`
              w-10 h-10 rounded-xl flex-shrink-0
              border flex items-center justify-center
              ${iconCls}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">
                  {value}
                </span>
                <span className={`
                  px-2 py-0.5 rounded-full
                  text-[0.68rem] font-bold border
                  ${pill}
                `}>
                  today
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Activity Table ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl overflow-hidden shadow-soft
      ">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <h3 className="text-[0.92rem] font-bold font-display text-foreground">
              Recent Login Events
            </h3>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5">
              Last {MOCK_ACTIVITY.length} login events across all users
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[0.72rem] text-muted-foreground font-medium">Live</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                {['User', 'Action', 'IP Address', 'Device', 'Location', 'Time', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`
                      px-6 py-3.5
                      text-[0.72rem] font-bold text-muted-foreground
                      uppercase tracking-widest
                      ${i === 6 ? 'text-right' : 'text-left'}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/25">
              {MOCK_ACTIVITY.map((item) => {
                const s = STATUS_STYLES[item.status];
                const StatusIcon = s.icon;
                return (
                  <tr
                    key={item.id}
                    className={`
                      group transition-colors duration-150
                      hover:bg-primary/[0.04]
                      ${s.rowBg}
                    `}
                  >
                    {/* User */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex-shrink-0
                          flex items-center justify-center
                          text-[0.70rem] font-bold
                          ${item.status === 'failed'
                            ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                            : 'bg-primary/10 border border-primary/20 text-primary'}
                        `}>
                          {item.avatar}
                        </div>
                        <div>
                          <p className="text-[0.82rem] font-semibold text-foreground leading-tight">
                            {item.user}
                          </p>
                          <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${s.iconCls}`} />
                        <span className="text-[0.82rem] text-foreground/80">
                          {item.action}
                        </span>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="px-6 py-3.5">
                      <span className="text-[0.78rem] text-muted-foreground font-mono">
                        {item.ip}
                      </span>
                    </td>

                    {/* Device */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-[0.78rem] text-muted-foreground">
                          {item.device}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-3.5">
                      <span className="text-[0.78rem] text-muted-foreground">
                        {item.location}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-[0.78rem] text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5 text-right">
                      <span className={`
                        inline-flex items-center gap-1.5
                        px-2.5 py-0.5 rounded-full
                        text-[0.72rem] font-bold border
                        ${s.pill}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {item.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="
          px-6 py-3.5 border-t border-border/40
          flex items-center justify-between
          bg-muted/10
        ">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[0.72rem] text-muted-foreground">
              All login events are encrypted and stored securely
            </span>
          </div>
          <span className="text-[0.72rem] text-muted-foreground">
            Showing {MOCK_ACTIVITY.length} of {MOCK_ACTIVITY.length} events
          </span>
        </div>
      </div>

    </PageWrapper>
  );
}