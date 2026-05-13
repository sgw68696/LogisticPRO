"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Package } from 'lucide-react';

const mockLiveMapData = [
  { id: 'shp-001', trackingNumber: 'LOG-2025-10001', driver: 'Ramesh Kumar', vehicle: 'MH 12 AB 1234', status: 'In Transit', location: 'Pune Highway', lat: 18.5204, lng: 73.8567, eta: '2h 30m' },
  { id: 'shp-005', trackingNumber: 'LOG-2025-10005', driver: 'Suresh Yadav', vehicle: 'DL 01 CD 5678', status: 'Out for Delivery', location: 'Chennai Central', lat: 13.0827, lng: 80.2707, eta: '45m' },
  { id: 'shp-012', trackingNumber: 'LOG-2025-10012', driver: 'Mahesh Sharma', vehicle: 'KA 01 EF 9012', status: 'In Transit', location: 'Bangalore Outer Ring', lat: 12.9716, lng: 77.5946, eta: '1h 15m' },
  { id: 'shp-018', trackingNumber: 'LOG-2025-10018', driver: 'Ganesh Patel', vehicle: 'MH 02 GH 3456', status: 'Picked Up', location: 'Mumbai Port Area', lat: 19.0760, lng: 72.8777, eta: '4h 00m' },
  { id: 'shp-023', trackingNumber: 'LOG-2025-10023', driver: 'Dinesh Singh', vehicle: 'TN 07 IJ 7890', status: 'In Transit', location: 'Hyderabad Expressway', lat: 17.3850, lng: 78.4867, eta: '3h 20m' },
];

export default function ManagerLiveMap() {
  return (
    <PageWrapper title="Live Map">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Live Fleet Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Interactive Map Component</p>
                <p className="text-sm text-muted-foreground mt-1">Real-time GPS tracking visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Shipments List */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Active Shipments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockLiveMapData.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.trackingNumber}</span>
                  <Badge className={
                    item.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    item.status === 'Out for Delivery' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }>
                    {item.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span>{item.driver} - {item.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span>ETA: {item.eta}</span>
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
