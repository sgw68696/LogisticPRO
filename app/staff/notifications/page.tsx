"use client";

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockNotifications } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, Package, CreditCard, Wrench, User, ShoppingCart, 
  AlertTriangle, Search, Check, Clock
} from 'lucide-react';

export default function StaffNotifications() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) ||
                         notification.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'read' && notification.read) ||
                         (filter === 'unread' && !notification.read);
    return matchesSearch && matchesFilter;
  });

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'shipment_delayed': Package,
      'payment_overdue': CreditCard,
      'maintenance_due': Wrench,
      'driver_off_duty': User,
      'new_order': ShoppingCart,
      'low_stock': AlertTriangle,
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'shipment_delayed': 'text-orange-600 bg-orange-50',
      'payment_overdue': 'text-red-600 bg-red-50',
      'maintenance_due': 'text-blue-600 bg-blue-50',
      'driver_off_duty': 'text-purple-600 bg-purple-50',
      'new_order': 'text-green-600 bg-green-50',
      'low_stock': 'text-yellow-600 bg-yellow-50',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const NotificationCard = ({ notification }: { notification: typeof mockNotifications[0] }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);
    
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
        !notification.read ? 'border-l-4 border-l-blue-500' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!notification.read && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      New
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
              
              {notification.actionUrl && (
                <div className="mt-3 pt-3 border-t">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <PageWrapper 
      title="Notifications" 
      description={`You have ${unreadCount} unread notifications`}
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({mockNotifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({mockNotifications.length - unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {search || filter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'You\'re all caught up! No new notifications.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
