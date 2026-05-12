'use client';

import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import {
  Truck, Waves, Plane, Package, TrendingUp,
  MapPin, AlertTriangle, Clock, BarChart3,
} from 'lucide-react';
import { mockVehicles, mockAircraft, mockShips, mockCargo } from '@/data/mockData';

export default function FleetManagementPage() {
  const vehicles = mockVehicles || [];
  const aircraft = mockAircraft || [];
  const ships = mockShips || [];
  const cargo = mockCargo || [];

  const totalAssets = vehicles.length + aircraft.length + ships.length;
  const activeAssets = 
    vehicles.filter(v => v.status === 'Available' || v.status === 'On Route').length +
    aircraft.filter(a => a.status === 'Available' || a.status === 'On Route').length +
    ships.filter(s => s.status === 'Active').length;

  const inTransitCargo = cargo.filter(c => c.status === 'In Transit').length;
  const totalCapacity = 
    vehicles.reduce((sum, v) => sum + v.capacity, 0) +
    aircraft.reduce((sum, a) => sum + a.capacity, 0) +
    ships.reduce((sum, s) => sum + s.cargoHoldCapacity, 0);

  return (
    <PageWrapper title="Fleet Management" icon={Truck}>
      <div className="space-y-6">
        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Assets"
            value={totalAssets}
            trend={{ value: 3, direction: 'up' }}
            icon={Truck}
            status="Active"
          />
          <KPICard
            title="Active Units"
            value={activeAssets}
            trend={{ value: 2, direction: 'up' }}
            icon={TrendingUp}
            status="Success"
          />
          <KPICard
            title="In Transit"
            value={inTransitCargo}
            trend={{ value: 1, direction: 'up' }}
            icon={MapPin}
            status="Active"
          />
          <KPICard
            title="Total Capacity"
            value={`${(totalCapacity / 1000000).toFixed(1)}M`}
            trend={{ value: 150, direction: 'up' }}
            icon={Package}
            status="Success"
          />
        </div>

        {/* Transport Mode Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Transport Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Land Transport */}
            <Link href="/transport/land" className="block">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-amber-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Land Transport</h3>
                  <Truck className="w-8 h-8 text-amber-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Vehicles</span>
                    <span className="font-semibold">{vehicles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="font-semibold text-green-600">{vehicles.filter(v => v.status === 'Available').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">On Route</span>
                    <span className="font-semibold text-blue-600">{vehicles.filter(v => v.status === 'On Route').length}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Capacity: {(vehicles.reduce((sum, v) => sum + v.capacity, 0) / 1000).toFixed(0)}K kg</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Air Transport */}
            <Link href="/transport/air" className="block">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-sky-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-600 transition h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Air Transport</h3>
                  <Plane className="w-8 h-8 text-sky-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Aircraft</span>
                    <span className="font-semibold">{aircraft.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="font-semibold text-green-600">{aircraft.filter(a => a.status === 'Available').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">In Maintenance</span>
                    <span className="font-semibold text-amber-600">{aircraft.filter(a => a.status === 'Maintenance').length}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-sky-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Capacity: {(aircraft.reduce((sum, a) => sum + a.capacity, 0) / 1000).toFixed(0)}K kg</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Water Transport */}
            <Link href="/transport/water" className="block">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-teal-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 transition h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Water Transport</h3>
                  <Waves className="w-8 h-8 text-teal-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Vessels</span>
                    <span className="font-semibold">{ships.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Active</span>
                    <span className="font-semibold text-green-600">{ships.filter(s => s.status === 'Active').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Docked</span>
                    <span className="font-semibold text-blue-600">{ships.filter(s => s.status === 'Docked').length}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-teal-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Capacity: {(ships.reduce((sum, s) => sum + s.cargoHoldCapacity, 0) / 1000).toFixed(0)}K tons</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Fleet Operations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Fleet Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/fleet/vehicles" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition">
                <h3 className="font-semibold mb-2">Vehicle Fleet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage land-based vehicle fleet operations</p>
                <Button variant="outline" size="sm" className="w-full">View Fleet</Button>
              </div>
            </Link>

            <Link href="/fleet/aircraft" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-600 transition">
                <h3 className="font-semibold mb-2">Aircraft Fleet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage air cargo and logistics</p>
                <Button variant="outline" size="sm" className="w-full">View Fleet</Button>
              </div>
            </Link>

            <Link href="/fleet/ships" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 transition">
                <h3 className="font-semibold mb-2">Ship Fleet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage maritime cargo operations</p>
                <Button variant="outline" size="sm" className="w-full">View Fleet</Button>
              </div>
            </Link>

            <Link href="/cargo" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 transition">
                <h3 className="font-semibold mb-2">Cargo Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track all shipments across modes</p>
                <Button variant="outline" size="sm" className="w-full">View Cargo</Button>
              </div>
            </Link>

            <Link href="/fleet/maintenance" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition">
                <h3 className="font-semibold mb-2">Maintenance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Schedule and track maintenance</p>
                <Button variant="outline" size="sm" className="w-full">View Schedule</Button>
              </div>
            </Link>

            <Link href="/fleet/analytics" className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Fleet performance and insights</p>
                <Button variant="outline" size="sm" className="w-full">View Analytics</Button>
              </div>
            </Link>
          </div>
        </div>

        {/* Fleet Health Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Fleet Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Utilization</span>
                <span className="text-2xl font-bold text-green-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">On-Time Performance</span>
                <span className="text-2xl font-bold text-blue-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Maintenance Compliance</span>
                <span className="text-2xl font-bold text-purple-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
