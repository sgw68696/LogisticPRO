'use client';

import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Truck, Plus, Edit2, Eye, Trash2, Filter, Download,
  TrendingUp, AlertTriangle, Calendar, Map,
} from 'lucide-react';
import { mockVehicles } from '@/data/mockData';

export default function VehicleFleetPage() {
  const vehicles = mockVehicles || [];
  
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const onRouteVehicles = vehicles.filter(v => v.status === 'On Route').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
  
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const totalMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
  const avgAge = vehicles.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (2025 - (v.year || 2020)), 0) / vehicles.length)
    : 0;

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Available: 'Success',
    'On Route': 'Active',
    Maintenance: 'Pending',
    Inactive: 'Error',
  };

  return (
    <PageWrapper title="Vehicle Fleet Management" icon={Truck}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Vehicles"
            value={totalVehicles}
            trend={{ value: 2, direction: 'up' }}
            icon={Truck}
            status="Active"
          />
          <KPICard
            title="Available"
            value={availableVehicles}
            trend={{ value: 1, direction: 'up' }}
            icon={TrendingUp}
            status="Success"
          />
          <KPICard
            title="On Route"
            value={onRouteVehicles}
            trend={{ value: 0, direction: 'stable' }}
            icon={Map}
            status="Active"
          />
          <KPICard
            title="Total Capacity"
            value={`${(totalCapacity / 1000).toFixed(1)}K`}
            trend={{ value: 100, direction: 'up' }}
            icon={TrendingUp}
            status="Success"
          />
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Status</h3>
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Available</span>
                <span className="font-semibold text-green-600">{availableVehicles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">On Route</span>
                <span className="font-semibold text-blue-600">{onRouteVehicles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                <span className="font-semibold text-amber-600">{maintenanceVehicles}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-green-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Metrics</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Average Age</span>
                <span className="font-semibold">{avgAge} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Capacity</span>
                <span className="font-semibold">{(totalCapacity / 1000).toFixed(1)}K kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Mileage</span>
                <span className="font-semibold">{(totalMileage / 1000000).toFixed(1)}M km</span>
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
            Add Vehicle
          </Button>
        </div>

        {/* Vehicles List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Fleet ({vehicles.length})</h3>
          </div>

          {vehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Registration</th>
                    <th className="px-4 py-3 text-left font-semibold">Type & Year</th>
                    <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                    <th className="px-4 py-3 text-left font-semibold">Mileage</th>
                    <th className="px-4 py-3 text-left font-semibold">Driver</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 font-medium">{vehicle.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm">{vehicle.type} / {vehicle.year || 'N/A'}</td>
                      <td className="px-4 py-3">{vehicle.capacity.toLocaleString()} kg</td>
                      <td className="px-4 py-3">{(vehicle.mileage || 0).toLocaleString()} km</td>
                      <td className="px-4 py-3 text-sm">{vehicle.driver || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={vehicle.status as any}
                          type={statuses[vehicle.status] || 'Pending'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/fleet/vehicles/${vehicle.id}`}>
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

        {/* Maintenance & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Maintenance Schedule</h3>
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              {vehicles.slice(0, 4).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{vehicle.registrationNumber}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    Due: {Math.round(Math.random() * 60)} days
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vehicle Distribution</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Light Duty Trucks</span>
                  <span className="font-semibold">{vehicles.filter(v => v.type === 'Light Duty Truck').length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Heavy Duty Trucks</span>
                  <span className="font-semibold">{vehicles.filter(v => v.type === 'Heavy Duty Truck').length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Vans</span>
                  <span className="font-semibold">{vehicles.filter(v => v.type === 'Van').length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
