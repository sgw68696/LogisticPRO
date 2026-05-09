"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogBody, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  getWarehouses, getWarehouseById,
  getLowStockItems, transferInventory,
} from "@/services/warehouseService";
import { type Warehouse, type InventoryItem } from "@/data/mockData";
import {
  Building, Package, AlertTriangle, ArrowUpDown,
  Search, MapPin, Box, AlertCircle, Filter,
} from "lucide-react";
import { toast } from "sonner";

// ── Shared styles ───────────────────────────
const inputCls = `
  w-full h-10 px-3
  bg-muted/40 border border-border
  rounded-[9px] text-[0.84rem] text-foreground
  outline-none placeholder:text-muted-foreground
  transition-all duration-200
  focus:border-primary/60 focus:bg-primary/5
  focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
`;

const selectTriggerCls = `
  h-10 text-[0.84rem]
  bg-muted/40 border-border rounded-[9px]
  focus:ring-0 focus:border-primary/60
`;

const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5"
  >
    {children}
  </label>
);

// ── Capacity color util ──────────────────────
const capacityColor = (pct: number) => {
  if (pct >= 90) return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
  if (pct >= 75) return { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { bar: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' };
};

// ── Stock badge ──────────────────────────────
function StockBadge({ qty }: { qty: number }) {
  const isLow = qty < 50;
  const isMed = qty < 100;
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full
      text-[0.7rem] font-bold border
      ${isLow
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : isMed
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : 'bg-green-500/10 border-green-500/20 text-green-400'
      }
    `}>
      {isLow ? 'Low Stock' : isMed ? 'Medium' : 'In Stock'}
    </span>
  );
}

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [lowStockItems, setLowStockItems] = useState<{ warehouse: string; items: InventoryItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    sourceWarehouse: "", destinationWarehouse: "", sku: "", quantity: 1,
  });

  useEffect(() => {
    loadWarehouses();
    loadLowStockItems();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await getWarehouses({
        search: searchQuery,
        city: cityFilter !== "all" ? cityFilter : undefined,
      });
      setWarehouses(data);
    } catch {
      toast.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockItems = async () => {
    try {
      setLowStockItems(await getLowStockItems());
    } catch {
      toast.error("Failed to load stock alerts");
    }
  };

  const handleWarehouseSelect = async (id: string) => {
    try {
      setSelectedWarehouse(await getWarehouseById(id));
    } catch {
      toast.error("Failed to load warehouse details");
    }
  };

  const handleTransfer = async () => {
    try {
      await transferInventory(
        transferData.sourceWarehouse,
        transferData.destinationWarehouse,
        [{ sku: transferData.sku, quantity: transferData.quantity }]
      );
      toast.success("Inventory transferred successfully");
      setIsTransferDialogOpen(false);
      setTransferData({ sourceWarehouse: "", destinationWarehouse: "", sku: "", quantity: 1 });
      loadWarehouses();
      if (selectedWarehouse) handleWarehouseSelect(selectedWarehouse.id);
    } catch {
      toast.error("Failed to transfer inventory");
    }
  };

  const totalCapacity = warehouses.reduce((s, w) => s + w.capacity, 0);
  const totalStock = warehouses.reduce((s, w) => s + w.currentStock, 0);
  const totalAlerts = lowStockItems.reduce((s, w) => s + w.items.length, 0);
  const overallPct = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0;

  const kpiCards = [
    {
      label: 'Total Warehouses', value: warehouses.length,
      sub: 'Active locations',
      icon: <Building size={18} />,
      color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
      valueColor: 'text-foreground',
    },
    {
      label: 'Total Capacity', value: totalCapacity.toLocaleString(),
      sub: 'Units across all warehouses',
      icon: <Box size={18} />,
      color: 'bg-green-500/10 border-green-500/15 text-green-400',
      valueColor: 'text-foreground',
    },
    {
      label: 'Current Stock', value: totalStock.toLocaleString(),
      sub: `${overallPct.toFixed(1)}% capacity used`,
      icon: <Package size={18} />,
      color: 'bg-amber-500/10 border-amber-500/15 text-amber-400',
      valueColor: 'text-foreground',
    },
    {
      label: 'Low Stock Alerts', value: totalAlerts,
      sub: 'Items need restocking',
      icon: <AlertTriangle size={18} />,
      color: totalAlerts > 0
        ? 'bg-red-500/10 border-red-500/15 text-red-400'
        : 'bg-green-500/10 border-green-500/15 text-green-400',
      valueColor: totalAlerts > 0 ? 'text-red-400' : 'text-green-400',
    },
  ];

  if (loading) return (
    <PageWrapper title="Warehouse Management" description="Manage warehouse locations and inventory">
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border border-border/60 rounded-xl p-5 animate-pulse">
            <div className="h-16 bg-muted/40 rounded-lg" />
          </div>
        ))}
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Warehouse Management"
      description="Manage warehouse locations, inventory, and transfers"
      actions={
        <button
          onClick={() => setIsTransferDialogOpen(true)}
          className="
            flex items-center gap-2 px-3.5 py-2 rounded-[10px]
            text-[0.82rem] font-bold text-white font-display
            hover:-translate-y-px transition-all duration-200
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <ArrowUpDown size={14} /> Transfer Inventory
        </button>
      }
    >
      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {kpiCards.map(({ label, value, sub, icon, color, valueColor }) => (
          <div
            key={label}
            className="
              group relative bg-card border border-border/60
              rounded-xl p-5 shadow-soft overflow-hidden
              transition-all duration-300
              hover:-translate-y-0.5 hover:border-primary/25
              hover:shadow-[0_8px_28px_oklch(var(--primary)/0.08)]
              before:absolute before:inset-x-0 before:top-0 before:h-px
              before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300
              hover:before:opacity-100
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1">
                  {label}
                </p>
                <p className={`text-[1.9rem] font-extrabold font-display leading-none mb-1 ${valueColor}`}>
                  {value}
                </p>
                <p className="text-[0.7rem] text-muted-foreground/70">{sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${color}`}>
                {icon}
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadWarehouses()}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'].map(c => (
                  <SelectItem key={c} value={c} className="text-[0.82rem]">
                    {c === 'all' ? 'All Cities' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={loadWarehouses}
              className="
                flex items-center gap-1.5 px-3.5 py-2
                bg-primary/10 border border-primary/20
                rounded-[9px] text-[0.82rem] font-bold text-primary
                hover:bg-primary/15 transition-colors duration-150
              "
            >
              <Filter size={13} /> Apply
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 border border-border/60 rounded-[10px] p-1 h-auto gap-1">
          {[
            { value: 'overview', label: 'Overview', count: warehouses.length },
            { value: 'inventory', label: 'Inventory', count: selectedWarehouse?.inventory.length },
            { value: 'transfers', label: 'Transfers' },
            { value: 'alerts', label: 'Alerts', count: totalAlerts, alert: totalAlerts > 0 },
          ].map(({ value, label, count, alert }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                text-[0.8rem] font-semibold rounded-[8px] px-4 py-1.5
                data-[state=active]:bg-card data-[state=active]:text-foreground
                data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60
                text-muted-foreground transition-all duration-200
              "
            >
              {label}
              {count !== undefined && (
                <span className={`ml-2 text-[0.7rem] font-bold ${alert ? 'text-red-400' : 'text-primary'}`}>
                  {count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {warehouses.map(warehouse => {
              const pct = (warehouse.currentStock / warehouse.capacity) * 100;
              const colors = capacityColor(pct);
              const isSelected = selectedWarehouse?.id === warehouse.id;
              return (
                <div
                  key={warehouse.id}
                  onClick={() => handleWarehouseSelect(warehouse.id)}
                  className={`
                    group relative bg-card border rounded-xl overflow-hidden cursor-pointer
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_28px_rgba(0,0,0,0.15)]
                    before:absolute before:inset-x-0 before:top-0 before:h-px
                    before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent
                    before:opacity-0 before:transition-opacity before:duration-200
                    hover:before:opacity-100
                    ${isSelected
                      ? 'border-primary/50 shadow-[0_0_0_2px_oklch(var(--primary)/0.15)] before:opacity-100'
                      : 'border-border/60 hover:border-primary/30'
                    }
                  `}
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4 border-b border-border/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                        >
                          <Building size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-[0.88rem] font-bold font-display text-foreground tracking-tight">
                            {warehouse.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-0.5 text-[0.72rem] text-muted-foreground">
                            <MapPin size={10} />
                            <span>{warehouse.location}</span>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-green-500/10 border border-green-500/20 text-green-400 flex-shrink-0">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="px-5 py-3 border-b border-border/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[0.72rem] font-medium text-muted-foreground">Capacity Usage</span>
                      <span className={`text-[0.72rem] font-bold ${colors.text}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="px-5 py-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Current Stock', value: warehouse.currentStock.toLocaleString() },
                      { label: 'Total Capacity', value: warehouse.capacity.toLocaleString() },
                      { label: 'Manager', value: warehouse.manager },
                      { label: 'SKUs', value: warehouse.inventory.length },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-0.5">
                          {label}
                        </p>
                        <p className="text-[0.82rem] font-bold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Inventory Tab ── */}
        <TabsContent value="inventory">
          {selectedWarehouse ? (
            <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                <div>
                  <h3 className="text-[0.92rem] font-bold font-display text-foreground">
                    {selectedWarehouse.name} — Inventory
                  </h3>
                  <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                    {selectedWarehouse.inventory.length} SKUs tracked
                  </p>
                </div>
                <span className="text-[0.72rem] text-muted-foreground">
                  {selectedWarehouse.currentStock.toLocaleString()} units total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      {['SKU', 'Product Name', 'Category', 'Quantity', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWarehouse.inventory.map((item, i) => (
                      <tr
                        key={item.sku}
                        className={`
                          border-b border-border/30 last:border-0
                          transition-colors duration-150 hover:bg-muted/20
                          ${i % 2 === 0 ? '' : 'bg-muted/5'}
                        `}
                      >
                        <td className="px-5 py-3 font-mono text-[0.78rem] font-bold text-primary">
                          {item.sku}
                        </td>
                        <td className="px-5 py-3 text-[0.82rem] font-medium text-foreground">
                          {item.productName}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold bg-muted/60 border border-border/60 text-muted-foreground">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[0.82rem] font-bold text-foreground">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <StockBadge qty={item.quantity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/60 rounded-xl shadow-soft flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
                <Package size={28} className="text-muted-foreground opacity-40" />
              </div>
              <p className="text-[0.88rem] font-semibold text-muted-foreground">No Warehouse Selected</p>
              <p className="text-[0.78rem] text-muted-foreground/60">
                Click a warehouse in Overview to view its inventory
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Transfers Tab ── */}
        <TabsContent value="transfers">
          <div className="bg-card border border-border/60 rounded-xl shadow-soft flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
              <ArrowUpDown size={26} className="text-muted-foreground opacity-40" />
            </div>
            <p className="text-[0.88rem] font-semibold text-muted-foreground">No Recent Transfers</p>
            <p className="text-[0.78rem] text-muted-foreground/60 text-center max-w-[240px]">
              Use the Transfer Inventory button above to move items between warehouses
            </p>
            <button
              onClick={() => setIsTransferDialogOpen(true)}
              className="
                flex items-center gap-2 px-4 py-2 mt-1 rounded-[9px]
                text-[0.8rem] font-bold text-white font-display
                hover:-translate-y-px transition-all duration-200
                hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
              "
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <ArrowUpDown size={13} /> Transfer Inventory
            </button>
          </div>
        </TabsContent>

        {/* ── Alerts Tab ── */}
        <TabsContent value="alerts">
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-[0.92rem] font-bold font-display text-foreground">
                  Low Stock Alerts
                </h3>
                <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                  Items that need to be restocked soon
                </p>
              </div>
              {totalAlerts > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[0.72rem] font-bold text-red-400">
                  <AlertTriangle size={11} /> {totalAlerts} alerts
                </span>
              )}
            </div>
            <div className="p-5">
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map((wh, i) => (
                    <div key={i} className="border border-border/60 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/20 border-b border-border/40">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                          <Building size={13} className="text-primary" />
                        </div>
                        <span className="text-[0.84rem] font-bold text-foreground">{wh.warehouse}</span>
                        <span className="ml-auto text-[0.7rem] text-muted-foreground">
                          {wh.items.length} item{wh.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="divide-y divide-border/30">
                        {wh.items.map((item, j) => (
                          <div key={j} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors duration-150">
                            <div>
                              <span className="text-[0.82rem] font-medium text-foreground">{item.productName}</span>
                              <span className="ml-2 font-mono text-[0.7rem] text-muted-foreground">({item.sku})</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[0.7rem] font-bold text-red-400">
                              <AlertCircle size={10} /> {item.quantity} units
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/15 flex items-center justify-center">
                    <AlertCircle size={24} className="text-green-400" />
                  </div>
                  <p className="text-[0.88rem] font-semibold text-muted-foreground">All Clear</p>
                  <p className="text-[0.78rem] text-muted-foreground/60">All warehouses have adequate stock levels</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Transfer Dialog ── */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Inventory</DialogTitle>
            <DialogDescription>Move inventory between warehouses</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel>Source Warehouse</FieldLabel>
              <Select
                value={transferData.sourceWarehouse}
                onValueChange={v => setTransferData(p => ({ ...p, sourceWarehouse: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id} className="text-[0.82rem]">{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FieldLabel>Destination Warehouse</FieldLabel>
              <Select
                value={transferData.destinationWarehouse}
                onValueChange={v => setTransferData(p => ({ ...p, destinationWarehouse: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  {warehouses
                    .filter(w => w.id !== transferData.sourceWarehouse)
                    .map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-[0.82rem]">{w.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="sku">SKU</FieldLabel>
                <input
                  id="sku"
                  placeholder="Enter SKU"
                  value={transferData.sku}
                  onChange={e => setTransferData(p => ({ ...p, sku: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="qty">Quantity</FieldLabel>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  value={transferData.quantity}
                  onChange={e => setTransferData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                  className={inputCls}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsTransferDialogOpen(false)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={!transferData.sourceWarehouse || !transferData.destinationWarehouse || !transferData.sku}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Transfer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}