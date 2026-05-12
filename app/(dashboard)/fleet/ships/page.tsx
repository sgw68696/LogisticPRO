'use client';

import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Waves, Plus, Edit2, Eye, Trash2, Filter, Download,
  Users, Anchor, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { mockShips } from '@/data/mockData';

export default function ShipFleetPage() {
  const ships = mockShips || [];
  
  const totalShips = ships.length;
  const activeShips = ships.filter(s => s.status === 'Active').length;
  const dockedShips = ships.filter(s => s.status === 'Docked').length;
  const maintenanceShips = ships.filter(s => s.status === 'Maintenance').length;
  
  const totalCapacity = ships.reduce((sum, s) => sum + s.cargoHoldCapacity, 0);
  const totalCrew = ships.reduce((sum, s) => sum + s.crewSize, 0);
  const avgAge = ships.length > 0 
    ? Math.round(ships.reduce((sum, s) => sum + (2025 - s.yearBuilt), 0) / ships.length)
    : 0;

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Active: 'Success',
    Inactive: 'Pending',
    Maintenance: 'Pending',
    Docked: 'Active',
    Decommissioned: 'Error',
  };

  return (
    <PageWrapper title="Ship Fleet Management" icon={Waves}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Vessels"
            value={totalShips}
            trend={{ value: 1, direction: 'up' }}
            icon={Waves}
            status="Active"
          />
          <KPICard
            title="Active Fleet"
            value={activeShips}
            trend={{ value: 1, direction: 'stable' }}
            icon={Anchor}
            status="Success"
          />
          <KPICard
            title="Total Crew"
            value={totalCrew}
            trend={{ value: 5, direction: 'up' }}
            icon={Users}
            status="Active"
          />
          <KPICard
            title="Capacity"
            value={`${(totalCapacity / 1000).toFixed(0)}K`}
            trend={{ value: 155, direction: 'up' }}
            icon={TrendingUp}
            status="Success"
          />
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Status</h3>
              <Anchor className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active Vessels</span>
                <span className="font-semibold text-green-600">{activeShips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Docked</span>
                <span className="font-semibold text-blue-600">{dockedShips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                <span className="font-semibold text-amber-600">{maintenanceShips}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-teal-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Metrics</h3>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Average Age</span>
                <span className="font-semibold">{avgAge} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Capacity</span>
                <span className="font-semibold">{(totalCapacity / 1000).toFixed(0)}K tons</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Crew Members</span>
                <span className="font-semibold">{totalCrew}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vessel
          </Button>
        </div>

        {/* Ships List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Fleet ({ships.length})</h3>
          </div>

          {ships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Vessel Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Call Sign / IMO</th>
                    <th className="px-4 py-3 text-left font-semibold">Type & Built</th>
                    <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                    <th className="px-4 py-3 text-left font-semibold">Crew</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ships.map((ship) => (
                    <tr key={ship.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 font-medium">{ship.vesselName}</td>
                      <td className="px-4 py-3 text-sm">{ship.callSign} / {ship.imoNumber}</td>
                      <td className="px-4 py-3 text-sm">{ship.class} / {ship.yearBuilt}</td>
                      <td className="px-4 py-3">{ship.cargoHoldCapacity.toLocaleString()} tons</td>
                      <td className="px-4 py-3">{ship.crewSize}</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={ship.status as any}
                          type={statuses[ship.status] || 'Pending'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/fleet/ships/${ship.id}`}>
                            <button className="p-1 hover:bg-blue-100 dark:hover:bg-gray-700 rounded">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                          </Link>
                          <button className="p-1 hover:bg-amber-100 dark:hover:bg-gray-700 rounded">
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>
                          <button className="p-1 hover:bg-red-100 dark:hover:bg-gray-700 rounded">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Waves className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No vessels found</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4">Maintenance Schedule</h3>
            <div className="space-y-3">
              {ships.slice(0, 3).map((ship) => (
                <div key={ship.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{ship.vesselName}</span>
                  <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded">
                    {new Date(ship.nextDryDockDue).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4">Current Locations</h3>
            <div className="space-y-3">
              {ships.map((ship) => (
                <div key={ship.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{ship.vesselName}</span>
                  <span className="text-xs font-medium">{ship.currentLocation.port}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
