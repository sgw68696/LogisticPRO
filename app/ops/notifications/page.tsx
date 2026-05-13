'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockNotifications } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'shipment_delayed': AlertCircle,
    'payment_overdue': AlertCircle,
    'shipment_delivered': CheckCircle2,
    'new_shipment': Bell,
    'dispatch_completed': CheckCircle2,
    'driver_assigned': Clock,
  };
  return iconMap[type] || Bell;
};

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'shipment_delayed': 'text-orange-400 bg-orange-500/10',
    'payment_overdue': 'text-red-400 bg-red-500/10',
    'shipment_delivered': 'text-green-400 bg-green-500/10',
    'new_shipment': 'text-blue-400 bg-blue-500/10',
    'dispatch_completed': 'text-green-400 bg-green-500/10',
    'driver_assigned': 'text-cyan-400 bg-cyan-500/10',
  };
  return colorMap[type] || 'text-cyan-400 bg-cyan-500/10';
};

export default function NotificationsPage() {
  const displayNotifications = useMemo(() => {
    return mockNotifications.slice(0, 20);
  }, []);

  return (
    <PageWrapper 
      title="Notifications" 
      description={`${mockNotifications.length} notifications`}
    >
      <div className="space-y-3">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            const notificationDate = new Date(notification.timestamp);
            const timeAgo = formatTimeAgo(notificationDate);

            return (
              <div
                key={notification.id}
                className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-4 hover:bg-[rgba(14,165,233,0.05)] transition-colors cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-[#e0f2fe] font-semibold text-sm">
                          {notification.title}
                        </h3>
                        <p className="text-[#94a3b8] text-sm mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge className="bg-cyan-500/10 text-cyan-700 border-cyan-200 border text-xs flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[#94a3b8] text-xs">{timeAgo}</span>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors"
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-12 text-center">
            <Bell className="w-12 h-12 text-[#94a3b8] mx-auto mb-4 opacity-50" />
            <p className="text-[#e0f2fe] font-semibold">No notifications</p>
            <p className="text-[#94a3b8] text-sm mt-2">All caught up!</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
