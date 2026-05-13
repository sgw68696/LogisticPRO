'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockVehicles } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

export default function LiveMapPage() {
  const vehicleLocations = useMemo(() => {
    return mockVehicles
      .filter(v => v.status === 'On Route')
      .slice(0, 12)
      .map(v => ({
        ...v,
        latitude: 19.0760 + (Math.random() - 0.5) * 0.5,
        longitude: 72.8777 + (Math.random() - 0.5) * 0.5,
      }));
  }, []);

  return (
    <PageWrapper title="Live Map" description="Track vehicle locations in real-time">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <MapPin className="w-12 h-12 text-cyan-400/60" />
            </div>
            <p className="text-[#e0f2fe] font-semibold">Live Map View</p>
            <p className="text-[#94a3b8] text-sm mt-2">Integration with mapping service required</p>
            <p className="text-[#94a3b8] text-xs mt-4">{vehicleLocations.length} vehicles on route</p>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[rgba(14,165,233,0.1)]">
            <h3 className="text-sm font-semibold text-[#e0f2fe]">Vehicles on Route</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {vehicleLocations.length > 0 ? (
              vehicleLocations.map((vehicle) => (
                <div key={vehicle.id} className="px-6 py-3 border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                  <p className="text-[#e0f2fe] text-sm font-mono">{vehicle.registrationNumber}</p>
                  <p className="text-[#94a3b8] text-xs mt-1">
                    📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                  </p>
                  <Badge className="mt-2 bg-cyan-500/10 text-cyan-700 border-cyan-200 border text-xs">
                    On Route
                  </Badge>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-[#94a3b8]">
                No vehicles currently on route
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
