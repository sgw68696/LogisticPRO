"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import {
  Dialog, DialogBody, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVehicles, createVehicle, deleteVehicle } from "@/services/fleetService";
import { type Vehicle } from "@/data/mockData";
import {
  Plus, Search, SlidersHorizontal, MoreHorizontal,
  Truck, MapPin, Wrench, Eye, Edit, Trash2,
  CheckCircle, Activity,
} from "lucide-react";
import { toast } from "sonner";

// ── Shared styles ──────────────────────────
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

// ── Stat card config ───────────────────────
const statCards = (s: { total: number; available: number; onRoute: number; maintenance: number }) => [
  {
    label: 'Total Vehicles', value: s.total,
    icon: <Truck size={18} />,
    color: 'bg-primary/10 border-primary/15 text-primary',
    valueColor: 'text-foreground',
  },
  {
    label: 'Available', value: s.available,
    icon: <CheckCircle size={18} />,
    color: 'bg-green-500/10 border-green-500/15 text-green-400',
    valueColor: 'text-green-400',
  },
  {
    label: 'On Route', value: s.onRoute,
    icon: <MapPin size={18} />,
    color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
    valueColor: 'text-sky-400',
  },
  {
    label: 'Maintenance', value: s.maintenance,
    icon: <Wrench size={18} />,
    color: 'bg-amber-500/10 border-amber-500/15 text-amber-400',
    valueColor: 'text-amber-400',
  },
];

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    licensePlate: "", type: "" as Vehicle["type"] | "",
    model: "", capacity: "",
  });

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      setVehicles(await getVehicles());
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!formData.licensePlate || !formData.type || !formData.model) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createVehicle({
        vehicleId: `VEH-${Date.now()}`,
        type: formData.type as Vehicle["type"],
        licensePlate: formData.licensePlate,
        model: formData.model,
        capacity: formData.capacity || "1000 kg",
        status: "Available",
        assignedDriver: null,
        currentLocation: "Warehouse - Main",
        maintenanceHistory: [],
        fuelLogs: [],
      });
      toast.success("Vehicle added successfully");
      setIsAddDialogOpen(false);
      setFormData({ licensePlate: "", type: "", model: "", capacity: "" });
      loadVehicles();
    } catch {
      toast.error("Failed to add vehicle");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      toast.success("Vehicle deleted successfully");
      loadVehicles();
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.vehicleId.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)) &&
      (statusFilter === "all" || v.status === statusFilter) &&
      (typeFilter === "all" || v.type === typeFilter)
    );
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "Available").length,
    onRoute: vehicles.filter(v => v.status === "On Route").length,
    maintenance: vehicles.filter(v => v.status === "Maintenance").length,
  };

  const columns: Column<Vehicle>[] = [
    {
      key: "vehicleId",
      header: "Vehicle",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="
            w-10 h-10 rounded-xl flex-shrink-0
            flex items-center justify-center
            bg-primary/10 border border-primary/15
          ">
            <Truck size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-bold text-primary font-display">
              {item.vehicleId}
            </p>
            <p className="text-[0.73rem] text-muted-foreground">{item.licensePlate}</p>
          </div>
        </div>
      ),
    },
    {
      key: "model",
      header: "Model",
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-medium text-foreground">{item.model}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => (
        <span className="
          inline-flex items-center gap-1.5 px-2.5 py-1
          bg-muted/50 border border-border/60
          rounded-full text-[0.72rem] font-semibold text-muted-foreground
        ">
          {item.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "currentLocation",
      header: "Location",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate max-w-[140px]">{item.currentLocation}</span>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (item) => (
        <span className="text-[0.82rem] text-foreground font-medium">{item.capacity}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="
                w-8 h-8 flex items-center justify-center rounded-lg
                bg-muted/40 border border-border/60 text-muted-foreground
                hover:bg-primary/10 hover:border-primary/30 hover:text-primary
                transition-all duration-200
              "
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="nb-dropdown w-44">
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer"
              onClick={e => { e.stopPropagation(); setSelectedVehicle(item); }}
            >
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Wrench size={13} /> Schedule Service
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
              onClick={e => { e.stopPropagation(); handleDeleteVehicle(item.id); }}
            >
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <PageWrapper title="Fleet Management" description="Manage your vehicle fleet">
      <SkeletonLoader variant="table" count={10} />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Fleet Management"
      description="Manage your vehicle fleet and maintenance schedules"
      actions={
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="
            flex items-center gap-2 px-3.5 py-2 rounded-[10px]
            text-[0.82rem] font-bold text-white font-display
            hover:-translate-y-px transition-all duration-200
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} /> Add Vehicle
        </button>
      }
    >
      {/* ── Stat Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {statCards(stats).map(({ label, value, icon, color, valueColor }) => (
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
                <p className={`text-[2rem] font-extrabold font-display leading-none ${valueColor}`}>
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

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, plate or model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Available', 'On Route', 'Maintenance', 'Inactive'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Status' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Truck', 'Van', 'Bike', 'Tempo'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Types' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result count */}
        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        data={filteredVehicles}
        columns={columns}
        pageSize={10}
        emptyMessage="No vehicles found"
      />

      {/* ── Add Vehicle Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>Enter the details for the new vehicle.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel htmlFor="licensePlate">License Plate *</FieldLabel>
              <input
                id="licensePlate"
                placeholder="e.g., MH 12 AB 1234"
                value={formData.licensePlate}
                onChange={e => setFormData(p => ({ ...p, licensePlate: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Type *</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={v => setFormData(p => ({ ...p, type: v as Vehicle["type"] }))}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    {['Truck', 'Van', 'Bike', 'Tempo'].map(v => (
                      <SelectItem key={v} value={v} className="text-[0.82rem]">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                <input
                  id="capacity"
                  placeholder="e.g., 5000 kg"
                  value={formData.capacity}
                  onChange={e => setFormData(p => ({ ...p, capacity: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="model">Model *</FieldLabel>
              <input
                id="model"
                placeholder="e.g., Tata 407"
                value={formData.model}
                onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                className={inputCls}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAddDialogOpen(false)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVehicle}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Add Vehicle
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Vehicle Detail Dialog ── */}
      <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>
              {selectedVehicle && `${selectedVehicle.model} — ${selectedVehicle.licensePlate}`}
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <DialogBody className="space-y-5">

              {/* Hero row */}
              <div className="
                flex items-center gap-4 p-4 rounded-xl
                bg-card border border-border/60
                relative overflow-hidden
                before:absolute before:inset-x-0 before:top-0 before:h-px
                before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent
              ">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_oklch(var(--primary)/0.2)]"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  <Truck size={26} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[1rem] font-extrabold font-display text-foreground tracking-tight">
                    {selectedVehicle.vehicleId}
                  </h3>
                  <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                    {selectedVehicle.model} · {selectedVehicle.licensePlate}
                  </p>
                </div>
                <StatusBadge status={selectedVehicle.status} />
              </div>

              {/* Info grid */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Vehicle Info */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Vehicle Info
                    </p>
                  </div>
                  <div className="p-4 space-y-0">
                    {[
                      { label: 'Type', value: selectedVehicle.type },
                      { label: 'Capacity', value: selectedVehicle.capacity },
                      { label: 'Location', value: selectedVehicle.currentLocation },
                      { label: 'Assigned Driver', value: selectedVehicle.assignedDriver || 'Unassigned' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <span className="text-[0.78rem] text-muted-foreground">{label}</span>
                        <span className="text-[0.82rem] font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Activity
                    </p>
                  </div>
                  <div className="p-4 space-y-0">
                    {[
                      {
                        label: 'Maintenance Records',
                        value: selectedVehicle.maintenanceHistory.length,
                        icon: <Wrench size={13} />,
                        color: 'bg-amber-500/10 text-amber-400',
                      },
                      {
                        label: 'Fuel Logs',
                        value: selectedVehicle.fuelLogs.length,
                        icon: <Activity size={13} />,
                        color: 'bg-sky-500/10 text-sky-400',
                      },
                    ].map(({ label, value, icon, color }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
                            {icon}
                          </div>
                          <span className="text-[0.78rem] text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-[0.82rem] font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedVehicle(null)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Edit size={13} /> Edit Vehicle
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}