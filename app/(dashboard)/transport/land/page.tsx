'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Truck, Plus, Edit2, Eye, Trash2, Filter, Download,
  BarChart3, AlertTriangle, Zap, Clock,
} from 'lucide-react';
import { mockVehicles } from '@/data/mockData';

export default function LandTransportPage() {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const vehicles = mockVehicles || [];
  const filteredVehicles = filterStatus === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.status === filterStatus);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const activeRoutes = vehicles.filter(v => v.status === 'On Route').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;

  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const avgAge = vehicles.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (2025 - v.year), 0) / vehicles.length)
    : 0;

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Available: 'Success',
    'On Route': 'Active',
    Maintenance: 'Pending',
    Inactive: 'Error',
  };

  return (
    <PageWrapper title="Land Transport Management" icon={Truck}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Vehicles"
            value={totalVehicles}
            trend={{ value: 5, direction: 'up' }}
            icon={Truck}
            status="Active"
          />
          <KPICard
            title="Available"
            value={availableVehicles}
            trend={{ value: 2, direction: 'up' }}
            icon={Zap}
            status="Success"
          />
          <KPICard
            title="Active Routes"
            value={activeRoutes}
            trend={{ value: 1, direction: 'down' }}
            icon={Clock}
            status="Pending"
          />
          <KPICard
            title="In Maintenance"
            value={maintenanceVehicles}
            trend={{ value: 0, direction: 'stable' }}
            icon={AlertTriangle}
            status="Error"
          />
        </div>

        {/* Fleet Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Capacity</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-600">{(totalCapacity / 1000).toFixed(0)}K kg</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total fleet capacity across all vehicles</p>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg per vehicle: <span className="font-semibold">{(totalCapacity / Math.max(vehicles.length, 1)).toFixed(0)} kg</span></p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-purple-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Age Analysis</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-purple-600">{avgAge} years</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average vehicle age</p>
              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Newest: <span className="font-semibold">2020</span> | Oldest: <span className="font-semibold">2015</span></p>
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
          <Link href="/transport/land/vehicles">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        {/* Vehicle List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Vehicles ({filteredVehicles.length})</h3>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ml-auto px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option>All</option>
                <option>Available</option>
                <option>On Route</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {filteredVehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Registration</th>
                    <th className="px-4 py-3 text-left font-semibold">Make & Model</th>
                    <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Driver</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 font-medium">{vehicle.registrationNumber}</td>
                      <td className="px-4 py-3">{vehicle.make} {vehicle.model}</td>
                      <td className="px-4 py-3">{vehicle.capacity.toLocaleString()} {vehicle.capacityUnit}</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={vehicle.status as any}
                          type={statuses[vehicle.status] || 'Pending'}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.currentDriver ? `Driver ${vehicle.currentDriver}` : 'Unassigned'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/transport/land/vehicles/${vehicle.id}`}>
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
              <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No vehicles found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/transport/land/vehicle-categories" className="block">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-700 hover:border-blue-400 transition cursor-pointer">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Vehicle Categories</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage vehicle types and specifications</p>
            </div>
          </Link>

          <Link href="/transport/land/vehicle-items" className="block">
            <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-gray-700 hover:border-green-400 transition cursor-pointer">
              <p className="font-semibold text-green-900 dark:text-green-100">Vehicle Items</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage items and spare parts inventory</p>
            </div>
          </Link>

          <Link href="/fleet/vehicles" className="block">
            <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-gray-700 hover:border-purple-400 transition cursor-pointer">
              <p className="font-semibold text-purple-900 dark:text-purple-100">Maintenance</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View maintenance schedules and history</p>
            </div>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
