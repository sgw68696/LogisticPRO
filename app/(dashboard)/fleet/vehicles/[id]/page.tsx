'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Truck, ArrowLeft, Edit2, MapPin, Users, Wrench,
  Calendar, Gauge, AlertTriangle, Fuel,
} from 'lucide-react';
import { mockVehicles } from '@/data/mockData';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const vehicle = mockVehicles.find(v => v.id === vehicleId);

  if (!vehicle) {
    return (
      <PageWrapper title="Vehicle Not Found" icon={Truck}>
        <div className="text-center py-12">
          <p>The requested vehicle was not found.</p>
          <Link href="/fleet/vehicles">
            <Button variant="outline" className="mt-4">Back to Fleet</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const statuses: Record<string, 'Active' | 'Pending' | 'Success' | 'Error'> = {
    Available: 'Success',
    'On Route': 'Active',
    Maintenance: 'Pending',
    Inactive: 'Error',
  };

  const nextServiceDue = new Date();
  nextServiceDue.setDate(nextServiceDue.getDate() + Math.random() * 60);

  return (
    <PageWrapper title={vehicle.registrationNumber} icon={Truck}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/fleet/vehicles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fleet
            </Button>
          </Link>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Vehicle
          </Button>
        </div>

        {/* Overview Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 border border-amber-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{vehicle.registrationNumber}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {vehicle.type} | VIN: {vehicle.vin || 'N/A'}
              </p>
            </div>
            <StatusBadge 
              status={vehicle.status as any}
              type={statuses[vehicle.status] || 'Pending'}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Make & Model</p>
              <p className="font-semibold">{vehicle.make || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Year</p>
              <p className="font-semibold">{vehicle.year || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Driver</p>
              <p className="font-semibold">{vehicle.driver || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="font-semibold capitalize">{vehicle.status}</p>
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
                    {vehicle.currentLocation?.city || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Mileage</p>
                  <p className="font-semibold">{(vehicle.mileage || 0).toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Miles Driven</p>
                  <p className="font-semibold">{((vehicle.mileage || 0) / 1.609).toLocaleString()} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engine Hours</p>
                  <p className="font-semibold">{Math.round((vehicle.mileage || 0) / 80)} hours</p>
                </div>
              </div>
            </div>

            {/* Capacity & Specifications */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cargo Capacity</p>
                  <p className="font-semibold">{vehicle.capacity.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weight (Empty)</p>
                  <p className="font-semibold">{Math.round(vehicle.capacity * 0.5).toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engine Type</p>
                  <p className="font-semibold">Diesel</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transmission</p>
                  <p className="font-semibold">Automatic</p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assigned Driver</h2>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Driver Name</p>
                  <p className="font-semibold">{vehicle.driver || 'Not Assigned'}</p>
                </div>
                {vehicle.driver && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">License Class</p>
                      <p className="font-semibold">C</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Driving Experience</p>
                      <p className="font-semibold">5+ years</p>
                    </div>
                  </>
                )}
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Service</p>
                  <p className="text-sm font-medium">45 days ago</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Service Due</p>
                  <p className="text-sm font-medium text-amber-600">{nextServiceDue.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inspection Status</p>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    Passed
                  </span>
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fuel Efficiency</p>
                  <p className="text-sm font-medium">7.2 L/100km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Speed</p>
                  <p className="text-sm font-medium">65 km/h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilization Rate</p>
                  <p className="text-sm font-medium">82%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">Schedule Maintenance</Button>
              <Button variant="outline" className="w-full">View Route History</Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">Retire Vehicle</Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium">Arrival at destination</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargo delivered successfully</p>
              </div>
              <span className="text-xs text-gray-500">30 minutes ago</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium">Cargo loaded: 2,500 kg</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading completed</p>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Departed from origin</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Route started</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
