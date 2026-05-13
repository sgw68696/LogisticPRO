"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Fuel, Gauge } from 'lucide-react';

const mockLiveGPSData = [
  { id: 'veh-001', registrationNumber: 'MH 12 AB 1234', driver: 'Ramesh Kumar', location: 'Pune Highway', lat: 18.5204, lng: 73.8567, speed: 65, fuel: 75, status: 'On Route' },
  { id: 'veh-002', registrationNumber: 'DL 01 CD 5678', driver: 'Suresh Yadav', location: 'Chennai Bypass', lat: 13.0827, lng: 80.2707, speed: 55, fuel: 60, status: 'On Route' },
  { id: 'veh-003', registrationNumber: 'KA 01 EF 9012', driver: 'Mahesh Sharma', location: 'Bangalore ORR', lat: 12.9716, lng: 77.5946, speed: 70, fuel: 85, status: 'On Route' },
  { id: 'veh-004', registrationNumber: 'MH 02 GH 3456', driver: 'Ganesh Patel', location: 'Mumbai Port', lat: 19.0760, lng: 72.8777, speed: 0, fuel: 90, status: 'Idle' },
  { id: 'veh-005', registrationNumber: 'TN 07 IJ 7890', driver: 'Dinesh Singh', location: 'Hyderabad Expressway', lat: 17.3850, lng: 78.4867, speed: 80, fuel: 45, status: 'On Route' },
];

export default function FleetLiveMap() {
  return (
    <PageWrapper title="Live GPS Tracking">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Real-Time GPS Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Interactive GPS Map</p>
                <p className="text-sm text-muted-foreground mt-1">Real-time vehicle location tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Status */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockLiveGPSData.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.registrationNumber}</span>
                  <Badge className={
                    item.status === 'On Route' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }>
                    {item.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span>{item.driver}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3 h-3" />
                    <span>{item.speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-3 h-3" />
                    <span>Fuel: {item.fuel}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
