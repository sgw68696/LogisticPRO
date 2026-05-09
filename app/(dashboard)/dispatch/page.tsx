"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getShipments, updateShipment } from "@/services/shipmentService";
import { getVehicles } from "@/services/fleetService";
import { getDrivers } from "@/services/driverService";
import { type Shipment, type Vehicle, type Driver } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import {
  Search, Truck, Package, MapPin, Clock,
  ArrowRight, CheckCircle, AlertCircle,
  Calendar, LayoutGrid, List, RefreshCw, Star,
} from "lucide-react";
import { toast } from "sonner";

// ── Driver avatar (reused from DriversPage) ──
function DriverAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sizeMap = { sm: "w-6 h-6 text-[0.6rem]", md: "w-8 h-8 text-[0.7rem]" };
  const colors = [
    "from-sky-500 to-indigo-500", "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600", "from-amber-500 to-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeMap[size]} rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${color}`}>
      {initials}
    </div>
  );
}

// ── Stat cards config ──
const buildStats = (
  pending: number, transit: number, delivery: number,
  vehicles: number, driversCount: number
) => [
  {
    label: 'Pending Assignment', value: pending,
    icon: <Clock size={18} />,
    color: 'bg-amber-500/10 border-amber-500/15 text-amber-400',
    valueColor: 'text-amber-400',
  },
  {
    label: 'In Transit', value: transit,
    icon: <Truck size={18} />,
    color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
    valueColor: 'text-sky-400',
  },
  {
    label: 'Out for Delivery', value: delivery,
    icon: <Package size={18} />,
    color: 'bg-indigo-500/10 border-indigo-500/15 text-indigo-400',
    valueColor: 'text-indigo-400',
  },
  {
    label: 'Available Resources',
    value: `${vehicles}V / ${driversCount}D`,
    icon: <CheckCircle size={18} />,
    color: 'bg-green-500/10 border-green-500/15 text-green-400',
    valueColor: 'text-green-400',
  },
];

export default function DispatchPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, v, d] = await Promise.all([getShipments(), getVehicles(), getDrivers()]);
      setShipments(s); setVehicles(v); setDrivers(d);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const pendingShipments = shipments.filter(s => s.status === "Pending" || s.status === "Picked Up");
  const inTransitShipments = shipments.filter(s => s.status === "In Transit");
  const outForDeliveryShipments = shipments.filter(s => s.status === "Out for Delivery");
  const availableVehicles = vehicles.filter(v => v.status === "Available");
  const availableDrivers = drivers.filter(d => d.status === "Active" || d.status === "Off Duty");

  const filteredPending = pendingShipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedShipment || !selectedVehicle || !selectedDriver) return;
    try {
      await updateShipment(selectedShipment.id, {
        status: "In Transit",
        assignedDriver: selectedDriver,
        assignedVehicle: selectedVehicle,
      });
      toast.success("Shipment assigned successfully");
      setSelectedShipment(null);
      setSelectedVehicle(""); setSelectedDriver("");
      loadData();
    } catch {
      toast.error("Failed to assign shipment");
    }
  };

  const clearSelection = () => {
    setSelectedShipment(null);
    setSelectedVehicle(""); setSelectedDriver("");
  };

  if (loading) return (
    <PageWrapper title="Dispatch Management" description="Assign shipments to vehicles">
      <SkeletonLoader variant="card" count={4} />
    </PageWrapper>
  );

  const stats = buildStats(
    pendingShipments.length, inTransitShipments.length,
    outForDeliveryShipments.length, availableVehicles.length, availableDrivers.length
  );

  return (
    <PageWrapper
      title="Dispatch Management"
      description="Assign shipments to vehicles and drivers"
      actions={
        <button
          onClick={loadData}
          className="
            flex items-center gap-2 px-3.5 py-2
            bg-muted/40 border border-border/60 rounded-[10px]
            text-[0.82rem] font-semibold text-muted-foreground
            hover:bg-primary/8 hover:border-primary/30 hover:text-foreground
            hover:-translate-y-px transition-all duration-200
          "
        >
          <RefreshCw size={13} /> Refresh
        </button>
      }
    >
      {/* ── Stat Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {stats.map(({ label, value, icon, color, valueColor }) => (
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
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-2">
                  {label}
                </p>
                <p className={`text-[1.9rem] font-extrabold font-display leading-none ${valueColor}`}>
                  {value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${color}`}>
                {icon}
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Pending Shipments Panel ── */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div>
              <h3 className="text-[0.92rem] font-bold font-display text-foreground tracking-tight">
                Pending Shipments
              </h3>
              <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                {filteredPending.length} awaiting assignment
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 w-[180px] pl-8 pr-3 bg-muted/40 border border-border rounded-[8px] text-[0.8rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_2px_oklch(var(--primary)/0.1)]"
                />
              </div>
              {/* View toggle */}
              <div className="flex items-center bg-muted/40 border border-border rounded-[8px] p-0.5">
                {(['grid', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`
                      w-7 h-7 flex items-center justify-center rounded-[6px]
                      transition-all duration-150
                      ${view === v
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {v === 'grid' ? <LayoutGrid size={13} /> : <List size={13} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="h-[500px] overflow-y-auto p-4 scrollbar-thin">
            {filteredPending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <Package size={28} className="opacity-30" />
                <p className="text-[0.84rem]">No pending shipments found</p>
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredPending.map(shipment => (
                  <ShipmentGridCard
                    key={shipment.id}
                    shipment={shipment}
                    selected={selectedShipment?.id === shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPending.map(shipment => (
                  <ShipmentListRow
                    key={shipment.id}
                    shipment={shipment}
                    selected={selectedShipment?.id === shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Assignment Panel ── */}
        <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h3 className="text-[0.92rem] font-bold font-display text-foreground tracking-tight">
              Assign Resources
            </h3>
            <p className="text-[0.72rem] text-muted-foreground mt-0.5">
              Select a shipment then assign vehicle & driver
            </p>
          </div>

          <div className="p-5">
            {selectedShipment ? (
              <div className="space-y-5">

                {/* Selected shipment summary */}
                <div className="
                  p-4 rounded-xl bg-primary/5 border border-primary/15
                  relative overflow-hidden
                  before:absolute before:inset-x-0 before:top-0 before:h-px
                  before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent
                ">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[0.8rem] font-bold text-primary">
                      {selectedShipment.trackingNumber}
                    </span>
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: <MapPin size={11} className="text-green-400" />, text: selectedShipment.pickupAddress.split(",")[0] },
                      { icon: <MapPin size={11} className="text-red-400" />, text: selectedShipment.deliveryAddress.split(",")[0] },
                      { icon: <Package size={11} className="text-muted-foreground" />, text: `${selectedShipment.packageWeight} kg · ${selectedShipment.packageDimensions}` },
                      { icon: <Calendar size={11} className="text-muted-foreground" />, text: `Deliver by ${formatDate(selectedShipment.estimatedDelivery)}` },
                    ].map(({ icon, text }, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">{icon}</div>
                        <span className="text-[0.78rem] text-foreground truncate">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle select */}
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5">
                    Select Vehicle
                  </label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="h-10 text-[0.82rem] bg-muted/40 border-border rounded-[9px] focus:ring-0 focus:border-primary/60">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent className="nb-dropdown">
                      {availableVehicles.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-[0.82rem]">
                          <div className="flex items-center gap-2">
                            <Truck size={12} className="text-primary" />
                            <span>{v.vehicleId} — {v.type}</span>
                            <span className="ml-auto text-[0.7rem] text-muted-foreground border border-border/60 rounded-full px-1.5 py-0.5">
                              {v.capacity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableVehicles.length === 0 && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[0.75rem] text-amber-400">
                      <AlertCircle size={12} /> No vehicles available
                    </p>
                  )}
                </div>

                {/* Driver select */}
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5">
                    Select Driver
                  </label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger className="h-10 text-[0.82rem] bg-muted/40 border-border rounded-[9px] focus:ring-0 focus:border-primary/60">
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                    <SelectContent className="nb-dropdown">
                      {availableDrivers.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-[0.82rem]">
                          <div className="flex items-center gap-2">
                            <DriverAvatar name={d.name} size="sm" />
                            <span>{d.name}</span>
                            <span className="ml-auto flex items-center gap-0.5 text-[0.7rem] text-amber-400 border border-amber-400/20 rounded-full px-1.5 py-0.5">
                              <Star size={9} className="fill-amber-400" />
                              {d.rating.toFixed(1)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDrivers.length === 0 && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[0.75rem] text-amber-400">
                      <AlertCircle size={12} /> No drivers available
                    </p>
                  )}
                </div>

                {/* Assign button */}
                <button
                  onClick={handleAssign}
                  disabled={!selectedVehicle || !selectedDriver}
                  className="
                    w-full flex items-center justify-center gap-2
                    py-2.5 rounded-[10px]
                    text-[0.84rem] font-bold text-white font-display
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    hover:-translate-y-px
                    hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
                  "
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  <CheckCircle size={15} /> Assign & Dispatch
                </button>

                <button
                  onClick={clearSelection}
                  className="
                    w-full py-2.5 rounded-[10px]
                    text-[0.82rem] font-semibold text-muted-foreground
                    bg-muted/40 border border-border
                    hover:text-foreground hover:bg-muted/70
                    transition-all duration-200
                  "
                >
                  Cancel Selection
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
                  <Package size={28} className="text-muted-foreground opacity-40" />
                </div>
                <p className="text-[0.88rem] font-semibold text-muted-foreground">
                  No Shipment Selected
                </p>
                <p className="text-[0.78rem] text-muted-foreground/60 max-w-[180px]">
                  Click on a pending shipment to assign resources
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Routes ── */}
      <div className="mt-6 bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h3 className="text-[0.92rem] font-bold font-display text-foreground tracking-tight">
            Active Routes
          </h3>
        </div>
        <div className="p-5">
          <Tabs defaultValue="inTransit">
            <TabsList className="
              bg-muted/40 border border-border/60
              rounded-[10px] p-1 h-auto gap-1
            ">
              {[
                { value: 'inTransit', label: 'In Transit', count: inTransitShipments.length, color: 'text-sky-400' },
                { value: 'outForDelivery', label: 'Out for Delivery', count: outForDeliveryShipments.length, color: 'text-indigo-400' },
              ].map(({ value, label, count, color }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    text-[0.8rem] font-semibold rounded-[8px] px-4 py-1.5
                    data-[state=active]:bg-card
                    data-[state=active]:text-foreground
                    data-[state=active]:shadow-sm
                    data-[state=active]:border data-[state=active]:border-border/60
                    text-muted-foreground
                    transition-all duration-200
                  "
                >
                  {label}
                  <span className={`ml-2 text-[0.7rem] font-bold ${color}`}>
                    {count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="inTransit" className="mt-4">
              <RouteCards shipments={inTransitShipments} emptyMessage="No shipments in transit" />
            </TabsContent>
            <TabsContent value="outForDelivery" className="mt-4">
              <RouteCards shipments={outForDeliveryShipments} emptyMessage="No shipments out for delivery" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </PageWrapper>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function ShipmentGridCard({ shipment, selected, onClick }: {
  shipment: Shipment; selected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-card border rounded-xl p-4 cursor-pointer
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]
        before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-xl
        before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-200
        hover:before:opacity-100
        ${selected
          ? 'border-primary/50 bg-primary/5 shadow-[0_0_0_2px_oklch(var(--primary)/0.2)] before:opacity-100'
          : 'border-border/60 hover:border-primary/30'
        }
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[0.78rem] font-bold text-primary">
          {shipment.trackingNumber}
        </span>
        <StatusBadge status={shipment.status} />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-[0.78rem] text-foreground">
          <MapPin size={10} className="text-green-400 flex-shrink-0" />
          <span className="truncate">{shipment.pickupAddress.split(",")[0]}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-0.5">
          <ArrowRight size={10} className="text-muted-foreground flex-shrink-0" />
        </div>
        <div className="flex items-center gap-1.5 text-[0.78rem] text-foreground">
          <MapPin size={10} className="text-red-400 flex-shrink-0" />
          <span className="truncate">{shipment.deliveryAddress.split(",")[0]}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[0.72rem] text-muted-foreground pt-2.5 border-t border-border/40">
        <span>{shipment.packageWeight} kg</span>
        <span>Est: {formatDate(shipment.estimatedDelivery)}</span>
      </div>
    </div>
  );
}

function ShipmentListRow({ shipment, selected, onClick }: {
  shipment: Shipment; selected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between
        p-3 rounded-xl cursor-pointer border
        transition-all duration-200
        ${selected
          ? 'border-primary/50 bg-primary/5 shadow-[0_0_0_2px_oklch(var(--primary)/0.15)]'
          : 'border-border/60 bg-card hover:border-primary/30 hover:bg-muted/30'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="
          w-10 h-10 rounded-xl flex-shrink-0
          flex items-center justify-center
          bg-primary/10 border border-primary/15
        ">
          <Package size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-[0.84rem] font-bold text-primary font-mono">
            {shipment.trackingNumber}
          </p>
          <p className="text-[0.73rem] text-muted-foreground">{shipment.receiverName}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[0.78rem] font-medium text-foreground">{shipment.packageWeight} kg</p>
          <p className="text-[0.72rem] text-muted-foreground">{formatDate(shipment.estimatedDelivery)}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>
    </div>
  );
}

function RouteCards({ shipments, emptyMessage }: { shipments: Shipment[]; emptyMessage: string }) {
  if (shipments.length === 0) return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
      <Truck size={24} className="opacity-30" />
      <p className="text-[0.84rem]">{emptyMessage}</p>
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {shipments.slice(0, 6).map(shipment => (
        <div
          key={shipment.id}
          className="
            bg-muted/20 border border-border/60 rounded-xl p-4
            hover:border-primary/20 hover:bg-muted/30
            transition-all duration-200
          "
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[0.78rem] font-bold text-primary">
              {shipment.trackingNumber}
            </span>
            <StatusBadge status={shipment.status} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-foreground">
              <MapPin size={10} className="text-green-400 flex-shrink-0" />
              <span className="truncate">{shipment.pickupAddress.split(",")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-foreground">
              <MapPin size={10} className="text-red-400 flex-shrink-0" />
              <span className="truncate">{shipment.deliveryAddress.split(",")[0]}</span>
            </div>
          </div>
          <p className="mt-2.5 pt-2.5 border-t border-border/40 text-[0.72rem] text-muted-foreground">
            Est: {formatDate(shipment.estimatedDelivery)}
          </p>
        </div>
      ))}
    </div>
  );
}