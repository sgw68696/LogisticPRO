'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Plane, Plus, Edit2, Eye, Trash2, Filter, Download,
  AlertTriangle, Zap, Clock, TrendingUp,
} from 'lucide-react';
import { mockAircraft } from '@/data/mockData';

export default function AirTransportPage() {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const aircraft = mockAircraft || [];
  const filteredAircraft = filterStatus === 'All' 
    ? aircraft 
    : aircraft.filter(a => a.status === filterStatus);

  const totalAircraft = aircraft.length;
  const availableAircraft = aircraft.filter(a => a.status === 'Available').length;
  const maintenanceAircraft = aircraft.filter(a => a.status === 'Maintenance').length;
  const totalCapacity = aircraft.reduce((sum, a) => sum + a.capacity, 0);

  const avgFlightHours = aircraft.length > 0
    ? Math.round(aircraft.reduce((sum, a) => sum + a.currentFlightHours, 0) / aircraft.length)
    : 0;

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Available: 'Success',
    'On Route': 'Active',
    Maintenance: 'Pending',
    Grounded: 'Error',
  };

  return (
    <PageWrapper title="Air Transport Management" icon={Plane}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Aircraft"
            value={totalAircraft}
            trend={{ value: 2, direction: 'up' }}
            icon={Plane}
            status="Active"
          />
          <KPICard
            title="Available"
            value={availableAircraft}
            trend={{ value: 1, direction: 'up' }}
            icon={Zap}
            status="Success"
          />
          <KPICard
            title="In Maintenance"
            value={maintenanceAircraft}
            trend={{ value: 1, direction: 'up' }}
            icon={Clock}
            status="Pending"
          />
          <KPICard
            title="Total Capacity"
            value={`${(totalCapacity / 1000).toFixed(0)}K`}
            trend={{ value: 90, direction: 'up' }}
            icon={TrendingUp}
            status="Success"
          />
        </div>

        {/* Fleet Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-sky-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fleet Hours</h3>
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-sky-600">{avgFlightHours.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average flight hours</p>
              <div className="mt-4 pt-4 border-t border-sky-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-semibold">{aircraft.reduce((sum, a) => sum + a.currentFlightHours, 0).toLocaleString()}</span> hours</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-orange-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Airworthiness Status</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-orange-600">{aircraft.filter(a => {
                const expiry = new Date(a.airworthinessExpiry);
                const now = new Date();
                return expiry > now;
              }).length}/{aircraft.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid certificates</p>
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
          <Link href="/transport/air/aircraft">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Aircraft
            </Button>
          </Link>
        </div>

        {/* Aircraft List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Aircraft Fleet ({filteredAircraft.length})</h3>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ml-auto px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option>All</option>
                <option>Available</option>
                <option>On Route</option>
                <option>Maintenance</option>
                <option>Grounded</option>
              </select>
            </div>
          </div>

          {filteredAircraft.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Registration</th>
                    <th className="px-4 py-3 text-left font-semibold">Manufacturer & Model</th>
                    <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                    <th className="px-4 py-3 text-left font-semibold">Flight Hours</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAircraft.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 font-medium">{a.registrationNumber}</td>
                      <td className="px-4 py-3">{a.manufacturer} {a.model}</td>
                      <td className="px-4 py-3">{a.capacity.toLocaleString()} {a.capacityUnit}</td>
                      <td className="px-4 py-3">{a.currentFlightHours.toLocaleString()} hrs</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={a.status as any}
                          type={statuses[a.status] || 'Pending'}
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
              <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No aircraft found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/transport/air/aircraft-categories" className="block">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-700 hover:border-blue-400 transition cursor-pointer">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Aircraft Types</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage aircraft categories and specs</p>
            </div>
          </Link>

          <Link href="/transport/air/aircraft-items" className="block">
            <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-gray-700 hover:border-green-400 transition cursor-pointer">
              <p className="font-semibold text-green-900 dark:text-green-100">Spares & Equipment</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage aircraft parts inventory</p>
            </div>
          </Link>

          <Link href="/fleet/aircraft" className="block">
            <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-gray-700 hover:border-purple-400 transition cursor-pointer">
              <p className="font-semibold text-purple-900 dark:text-purple-100">Maintenance</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Aircraft maintenance schedules</p>
            </div>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
