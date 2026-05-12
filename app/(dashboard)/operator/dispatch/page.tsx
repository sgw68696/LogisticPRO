"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { mockShipments } from '@/data/mockData';
import {
  Truck, AlertTriangle, Clock, Navigation2, MapPin,
  Radio, Zap, Activity, Plus, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get active routes
  const activeShipments = mockShipments.filter(s => 
    s.status === 'In Transit' || s.status === 'Out for Delivery'
  );

  const delayedShipments = mockShipments.filter(s => 
    s.status === 'In Transit' && Math.random() > 0.8
  ).slice(0, 3);

  const totalVehicles = Math.floor(Math.random() * 15) + 10;
  const activeVehicles = Math.floor(totalVehicles * 0.85);
  const maintenanceVehicles = Math.floor(totalVehicles * 0.15);

  // Daily dispatch data
  const dispatchData = [
    { time: '06:00', dispatched: 8, delivered: 2, issues: 0 },
    { time: '09:00', dispatched: 15, delivered: 5, issues: 1 },
    { time: '12:00', dispatched: 22, delivered: 12, issues: 2 },
    { time: '15:00', dispatched: 28, delivered: 20, issues: 1 },
    { time: '18:00', dispatched: 32, delivered: 25, issues: 3 },
  ];

  // Vehicle fleet status
  const fleetStatus = [
    { name: 'Available', value: activeVehicles },
    { name: 'In Use', value: Math.floor(activeVehicles * 0.6) },
    { name: 'Maintenance', value: maintenanceVehicles },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(8, 14, 28, 0.97)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
  };

  if (loading) {
    return (
      <PageWrapper title="Dispatch Operations">
        <SkeletonLoader variant="card" count={4} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Dispatch Control - ${user?.name?.split(' ')[0]}`}
      description="Real-time vehicle tracking and route management"
    >
      {/* Operation Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Active Routes"
          value={activeShipments.length}
          icon={<Navigation2 className="w-5 h-5" />}
          iconColor="blue"
          trend={{ value: 12, isPositive: true }}
          description="In progress"
        />
        <KPICard
          title="Active Vehicles"
          value={`${activeVehicles}/${totalVehicles}`}
          icon={<Truck className="w-5 h-5" />}
          iconColor="green"
          description="Available"
        />
        <KPICard
          title="Issues"
          value={delayedShipments.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="red"
          description="Requiring attention"
        />
        <KPICard
          title="Signal"
          value="98%"
          icon={<Radio className="w-5 h-5" />}
          iconColor="cyan"
          description="Fleet connectivity"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dispatch Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today's Dispatch Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dispatchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="time" stroke="rgba(148,163,184,0.5)" />
              <YAxis stroke="rgba(148,163,184,0.5)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="dispatched" fill="#3b82f6" />
              <Bar dataKey="delivered" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Real-time Fleet Status
          </h3>
          <div className="space-y-4">
            {fleetStatus.map((status, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{status.name}</p>
                  <div className="w-32 h-2 bg-background rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                      style={{ width: `${(status.value / totalVehicles) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">{status.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Routes */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Active Routes ({activeShipments.length})
          </h3>
          <Link href="/dispatch">
            <Button size="sm" variant="outline">Full Map</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Vehicle</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Route</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">ETA</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeShipments.slice(0, 6).map(shipment => (
                <tr key={shipment.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">
                    {shipment.assignedDriver}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {shipment.origin} → {shipment.destination}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={
                        shipment.status === 'In Transit'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }
                    >
                      {shipment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts & Issues */}
      {delayedShipments.length > 0 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Active Issues ({delayedShipments.length})
          </h3>
          <div className="space-y-3">
            {delayedShipments.map(shipment => (
              <div key={shipment.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-red-500/20">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{shipment.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Delayed - Expected arrival: {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleString() : 'TBD'}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
