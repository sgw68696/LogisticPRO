"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockWarehouses } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Package, TrendingUp, Users } from 'lucide-react';

export default function StaffWarehouse() {
  const WarehouseCard = ({ warehouse }: { warehouse: typeof mockWarehouses[0] }) => {
    const occupancyPercentage = Math.round((warehouse.currentStock / warehouse.capacity) * 100);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{warehouse.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{warehouse.warehouseId}</p>
            </div>
            <Building className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="truncate">{warehouse.location}</p>
            <p className="font-medium">{warehouse.city}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Stock</span>
              </div>
              <p className="text-lg font-semibold">
                {warehouse.currentStock.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                of {warehouse.capacity.toLocaleString()} units
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Occupancy</span>
              </div>
              <p className="text-lg font-semibold">{occupancyPercentage}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    occupancyPercentage > 80 ? 'bg-red-500' :
                    occupancyPercentage > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Manager</span>
              </div>
              <span className="font-medium">{warehouse.manager}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Contact</span>
              <span className="font-medium">{warehouse.contact}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageWrapper 
      title="Warehouse" 
      description="View warehouse data and inventory status"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockWarehouses.map((warehouse) => (
          <WarehouseCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>
    </PageWrapper>
  );
}
