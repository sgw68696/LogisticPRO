"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarehouses } from "@/services/warehouseService";
import { type Warehouse } from "@/data/mockData";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Users,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await getWarehouses();
      setWarehouses(data);
    } catch {
      toast.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    return (
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.warehouseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);
  const utilizationRate = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0;

  const columns: Column<Warehouse>[] = [
    {
      key: "name",
      header: "Warehouse",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <WarehouseIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.warehouseId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{item.city}</span>
        </div>
      ),
    },
    {
      key: "currentStock",
      header: "Utilization",
      render: (item) => {
        const percentage = (item.currentStock / item.capacity) * 100;
        return (
          <div className="w-32">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>{percentage.toFixed(0)}%</span>
              <span className="text-muted-foreground">
                {item.currentStock.toLocaleString()}/{item.capacity.toLocaleString()}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                percentage > 90
                  ? "[&>div]:bg-red-500"
                  : percentage > 70
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-green-500"
              }`}
            />
          </div>
        );
      },
    },
    {
      key: "manager",
      header: "Manager",
      sortable: true,
    },
    {
      key: "contact",
      header: "Contact",
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWarehouse(item);
                setIsDetailOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Warehouse Management" description="Manage your warehouses">
        <SkeletonLoader variant="table" count={10} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Warehouse Management"
      description="Manage your warehouses and inventory locations"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Warehouses</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <WarehouseIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{warehouses.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{(totalCapacity / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">units</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  utilizationRate > 80 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-green-100 dark:bg-green-900/30"
                }`}
              >
                <TrendingUp
                  className={`h-6 w-6 ${
                    utilizationRate > 80 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredWarehouses}
        columns={columns}
        pageSize={10}
        emptyMessage="No warehouses found"
      />

      {/* Warehouse Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Warehouse Details</DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <WarehouseIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedWarehouse.name}</h3>
                  <p className="text-muted-foreground">{selectedWarehouse.warehouseId}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{selectedWarehouse.location}</p>
                    <p>{selectedWarehouse.city}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Capacity &amp; Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Capacity</span>
                      <span className="font-medium">
                        {selectedWarehouse.capacity.toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Stock</span>
                      <span className="font-medium">
                        {selectedWarehouse.currentStock.toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-medium">
                        {((selectedWarehouse.currentStock / selectedWarehouse.capacity) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager</span>
                      <span className="font-medium">{selectedWarehouse.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span className="font-medium">{selectedWarehouse.contact}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKUs</span>
                      <span className="font-medium">{selectedWarehouse.inventory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recent Inbound</span>
                      <span className="font-medium">{selectedWarehouse.inboundLogs.length} entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recent Outbound</span>
                      <span className="font-medium">{selectedWarehouse.outboundLogs.length} entries</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Warehouse
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
