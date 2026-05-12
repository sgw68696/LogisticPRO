'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Waves, ArrowLeft, Edit2, MapPin, Users, Wrench,
  Calendar, Anchor, AlertTriangle, Fuel,
} from 'lucide-react';
import { mockShips } from '@/data/mockData';

export default function ShipDetailPage() {
  const params = useParams();
  const shipId = params.id as string;
  const ship = mockShips.find(s => s.id === shipId);

  if (!ship) {
    return (
      <PageWrapper title="Ship Not Found" icon={Waves}>
        <div className="text-center py-12">
          <p>The requested ship was not found.</p>
          <Link href="/fleet/ships">
            <Button variant="outline" className="mt-4">Back to Fleet</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Active: 'Success',
    Inactive: 'Pending',
    Maintenance: 'Pending',
    Docked: 'Active',
    Decommissioned: 'Error',
  };

  return (
    <PageWrapper title={ship.vesselName} icon={Waves}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/fleet/ships">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fleet
            </Button>
          </Link>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Vessel
          </Button>
        </div>

        {/* Overview Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 border border-blue-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ship.vesselName}</h1>
              <p className="text-gray-600 dark:text-gray-400">IMO: {ship.imoNumber} | Call Sign: {ship.callSign}</p>
            </div>
            <StatusBadge 
              status={ship.status as any}
              type={statuses[ship.status] || 'Pending'}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vessel Class</p>
              <p className="font-semibold">{ship.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Year Built</p>
              <p className="font-semibold">{ship.yearBuilt}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Flag State</p>
              <p className="font-semibold">{ship.flagState}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Owner</p>
              <p className="font-semibold">{ship.owner}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Data */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Operational Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Location</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {ship.currentLocation.port}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Port</p>
                  <p className="font-semibold">{ship.lastPortCall || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Scheduled Port</p>
                  <p className="font-semibold">{ship.nextScheduledPort || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days at Sea</p>
                  <p className="font-semibold">{ship.daysAtSea || 0}</p>
                </div>
              </div>
            </div>

            {/* Capacity & Dimensions */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Capacity & Dimensions</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cargo Hold Capacity</p>
                  <p className="font-semibold">{ship.cargoHoldCapacity.toLocaleString()} tons</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deadweight Tonnage</p>
                  <p className="font-semibold">{(ship.cargoHoldCapacity * 1.3).toLocaleString()} tons</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Length</p>
                  <p className="font-semibold">{ship.length || 'N/A'} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Beam</p>
                  <p className="font-semibold">{ship.beam || 'N/A'} m</p>
                </div>
              </div>
            </div>

            {/* Crew Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Crew Management</h2>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Crew Size</p>
                  <p className="font-semibold text-xl">{ship.crewSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Officers</p>
                  <p className="font-semibold text-xl">{Math.ceil(ship.crewSize * 0.2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Maintenance & Status */}
          <div className="space-y-6">
            {/* Maintenance Schedule */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Maintenance</h3>
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Dry Dock</p>
                  <p className="text-sm font-medium">{new Date(ship.lastDryDockDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Dry Dock Due</p>
                  <p className="text-sm font-medium text-amber-600">{new Date(ship.nextDryDockDue).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Fuel & Performance */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Performance</h3>
                <Fuel className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fuel Consumption</p>
                  <p className="text-sm font-medium">~45 tons/day</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Speed</p>
                  <p className="text-sm font-medium">~15 knots</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">Schedule Maintenance</Button>
              <Button variant="outline" className="w-full">Generate Report</Button>
              <Button variant="outline" className="w-full" className="text-red-600 hover:text-red-700">Decommission</Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium">Arrived at {ship.currentLocation.port}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Port call registered</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium">Cargo loaded: 8,500 tons</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Container loading completed</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Route update transmitted</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next port: destination confirmed</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
