'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Waves, Plus, Edit2, Eye, Trash2, Filter, Download,
  AlertTriangle, Anchor, TrendingUp, Users,
} from 'lucide-react';
import { mockShips } from '@/data/mockData';

export default function WaterTransportPage() {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const ships = mockShips || [];
  const filteredShips = filterStatus === 'All' 
    ? ships 
    : ships.filter(s => s.status === filterStatus);

  const totalShips = ships.length;
  const activeShips = ships.filter(s => s.status === 'Active').length;
  const maintenanceShips = ships.filter(s => s.status === 'Maintenance').length;
  const totalCapacity = ships.reduce((sum, s) => sum + s.cargoHoldCapacity, 0);

  const totalCrew = ships.reduce((sum, s) => sum + s.crewSize, 0);

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Active: 'Success',
    Inactive: 'Pending',
    Maintenance: 'Pending',
    Docked: 'Active',
    Decommissioned: 'Error',
  };

  return (
    <PageWrapper title="Water Transport Management" icon={Waves}>
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
            title="Active"
            value={activeShips}
            trend={{ value: 1, direction: 'stable' }}
            icon={Anchor}
            status="Success"
          />
          <KPICard
            title="In Maintenance"
            value={maintenanceShips}
            trend={{ value: 1, direction: 'up' }}
            icon={AlertTriangle}
            status="Pending"
          />
          <KPICard
            title="Total Crew"
            value={totalCrew}
            trend={{ value: 5, direction: 'up' }}
            icon={Users}
            status="Active"
          />
        </div>

        {/* Fleet Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-teal-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cargo Capacity</h3>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-teal-600">{(totalCapacity / 1000).toFixed(0)}K tons</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total cargo hold capacity</p>
              <div className="mt-4 pt-4 border-t border-teal-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg per vessel: <span className="font-semibold">{(totalCapacity / Math.max(ships.length, 1)).toFixed(0)} tons</span></p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-indigo-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Status</h3>
              <Anchor className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active Vessels</span>
                <span className="font-semibold text-green-600">{activeShips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">In Dock/Maintenance</span>
                <span className="font-semibold text-amber-600">{ships.filter(s => s.status === 'Docked' || s.status === 'Maintenance').length}</span>
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
          <Link href="/transport/water/ships">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vessel
            </Button>
          </Link>
        </div>

        {/* Ships List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Fleet ({filteredShips.length})</h3>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ml-auto px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option>All</option>
                <option>Active</option>
                <option>Docked</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {filteredShips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Vessel Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Call Sign / IMO</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Capacity (tons)</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredShips.map((ship) => (
                    <tr key={ship.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 font-medium">{ship.vesselName}</td>
                      <td className="px-4 py-3 text-sm">{ship.callSign} / {ship.imoNumber}</td>
                      <td className="px-4 py-3 text-sm">{ship.class}</td>
                      <td className="px-4 py-3">{ship.cargoHoldCapacity.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={ship.status as any}
                          type={statuses[ship.status] || 'Pending'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-blue-100 dark:hover:bg-gray-700 rounded">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/transport/water/ship-categories" className="block">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-700 hover:border-blue-400 transition cursor-pointer">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Ship Categories</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage ship types and specifications</p>
            </div>
          </Link>

          <Link href="/transport/water/ship-items" className="block">
            <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-gray-700 hover:border-green-400 transition cursor-pointer">
              <p className="font-semibold text-green-900 dark:text-green-100">Cargo Items</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage cargo types and specifications</p>
            </div>
          </Link>

          <Link href="/fleet/ships" className="block">
            <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-gray-700 hover:border-purple-400 transition cursor-pointer">
              <p className="font-semibold text-purple-900 dark:text-purple-100">Fleet Details</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View detailed fleet information</p>
            </div>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
