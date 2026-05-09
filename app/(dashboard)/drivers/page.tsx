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
import { getDrivers, createDriver, deleteDriver, type Driver } from "@/services/driverService";
import { formatDate } from "@/lib/utils";
import {
  Plus, Search, SlidersHorizontal, MoreHorizontal,
  User, Phone, Mail, Calendar, Star,
  Eye, Edit, Trash2, UserCheck, UserX, Truck,
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

// ── Avatar initials helper ──────────────────
const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

// ── Avatar component ────────────────────────
function DriverAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8 text-[0.7rem]",
    md: "w-10 h-10 text-[0.78rem]",
    lg: "w-14 h-14 text-[1rem]",
  };
  // Deterministic color from name
  const colors = [
    "from-sky-500 to-indigo-500",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`
      ${sizeMap[size]} rounded-xl flex-shrink-0
      flex items-center justify-center
      font-bold text-white font-display
      bg-gradient-to-br ${color}
      shadow-[0_2px_8px_rgba(0,0,0,0.2)]
    `}>
      {getInitials(name)}
    </div>
  );
}

// ── Stat cards config ───────────────────────
const statCards = (s: { total: number; active: number; onDuty: number; offDuty: number }) => [
  {
    label: 'Total Drivers', value: s.total,
    icon: <User size={18} />,
    color: 'bg-primary/10 border-primary/15 text-primary',
    valueColor: 'text-foreground',
  },
  {
    label: 'Active', value: s.active,
    icon: <UserCheck size={18} />,
    color: 'bg-green-500/10 border-green-500/15 text-green-400',
    valueColor: 'text-green-400',
  },
  {
    label: 'On Duty', value: s.onDuty,
    icon: <Truck size={18} />,
    color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
    valueColor: 'text-sky-400',
  },
  {
    label: 'Off Duty', value: s.offDuty,
    icon: <UserX size={18} />,
    color: 'bg-muted/60 border-border/60 text-muted-foreground',
    valueColor: 'text-muted-foreground',
  },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    licenseNumber: "", status: "Active" as Driver["status"],
  });

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      setDrivers(await getDrivers());
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async () => {
    if (!formData.name || !formData.phone || !formData.licenseNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createDriver({
        name: formData.name, email: formData.email,
        phone: formData.phone, licenseNumber: formData.licenseNumber,
        status: formData.status, joinDate: new Date().toISOString(),
        vehicleAssigned: null, rating: 5.0, totalTrips: 0,
        documents: [], tripHistory: [],
      });
      toast.success("Driver added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", licenseNumber: "", status: "Active" });
      loadDrivers();
    } catch {
      toast.error("Failed to add driver");
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    try {
      await deleteDriver(id);
      toast.success("Driver deleted successfully");
      loadDrivers();
    } catch {
      toast.error("Failed to delete driver");
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      (d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.includes(q)) &&
      (statusFilter === "all" || d.status === statusFilter)
    );
  });

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === "Active").length,
    onDuty: drivers.filter(d => d.status === "On Duty").length,
    offDuty: drivers.filter(d => d.status === "Off Duty").length,
  };

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <DriverAvatar name={item.name} size="md" />
          <div>
            <p className="text-[0.84rem] font-bold text-foreground">{item.name}</p>
            <p className="text-[0.73rem] text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground">
          <Phone size={12} className="flex-shrink-0" />
          <span>{item.phone}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "vehicleAssigned",
      header: "Vehicle",
      render: (item) => item.vehicleAssigned ? (
        <div className="flex items-center gap-1.5 text-[0.82rem] text-foreground">
          <Truck size={12} className="text-primary flex-shrink-0" />
          <span className="font-medium">{item.vehicleAssigned}</span>
        </div>
      ) : (
        <span className="text-[0.78rem] text-muted-foreground/60 italic">Unassigned</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span className="text-[0.84rem] font-bold text-foreground">
            {item.rating.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "totalTrips",
      header: "Trips",
      sortable: true,
      render: (item) => (
        <span className="
          inline-flex items-center px-2.5 py-1
          bg-muted/50 border border-border/60
          rounded-full text-[0.72rem] font-semibold text-muted-foreground
        ">
          {item.totalTrips}
        </span>
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
              onClick={e => { e.stopPropagation(); setSelectedDriver(item); }}
            >
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Truck size={13} /> Assign Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
              onClick={e => { e.stopPropagation(); handleDeleteDriver(item.id); }}
            >
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <PageWrapper title="Driver Management" description="Manage your drivers">
      <SkeletonLoader variant="table" count={10} />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Driver Management"
      description="Manage your drivers and their assignments"
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
          <Plus size={14} /> Add Driver
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Active', 'On Duty', 'Off Duty', 'Suspended'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Status' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground">
              {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        data={filteredDrivers}
        columns={columns}
        pageSize={10}
        emptyMessage="No drivers found"
      />

      {/* ── Add Driver Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter the details for the new driver.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel htmlFor="name">Full Name *</FieldLabel>
              <input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <input
                  id="email"
                  type="email"
                  placeholder="driver@email.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                <input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="licenseNumber">License Number *</FieldLabel>
                <input
                  id="licenseNumber"
                  placeholder="DL-1234567890"
                  value={formData.licenseNumber}
                  onChange={e => setFormData(p => ({ ...p, licenseNumber: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={v => setFormData(p => ({ ...p, status: v as Driver["status"] }))}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    {['Active', 'On Duty', 'Off Duty'].map(v => (
                      <SelectItem key={v} value={v} className="text-[0.82rem]">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              onClick={handleAddDriver}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Add Driver
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Driver Detail Dialog ── */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>
              {selectedDriver && `License: ${selectedDriver.licenseNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <DialogBody className="space-y-5">

              {/* Hero row */}
              <div className="
                flex items-center gap-4 p-4 rounded-xl
                bg-card border border-border/60 relative overflow-hidden
                before:absolute before:inset-x-0 before:top-0 before:h-px
                before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent
              ">
                <DriverAvatar name={selectedDriver.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[1rem] font-extrabold font-display text-foreground tracking-tight">
                    {selectedDriver.name}
                  </h3>
                  <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                    {selectedDriver.email}
                  </p>
                </div>
                <StatusBadge status={selectedDriver.status} />
              </div>

              {/* Info grid */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Contact Info */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Contact Info
                    </p>
                  </div>
                  <div className="p-4 space-y-0">
                    {[
                      { icon: <Phone size={12} />, value: selectedDriver.phone, color: 'bg-sky-500/10 text-sky-400' },
                      { icon: <Mail size={12} />, value: selectedDriver.email, color: 'bg-indigo-500/10 text-indigo-400' },
                      { icon: <Calendar size={12} />, value: `Joined ${formatDate(selectedDriver.joinDate)}`, color: 'bg-muted/60 text-muted-foreground' },
                    ].map(({ icon, value, color }, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
                          {icon}
                        </div>
                        <span className="text-[0.82rem] text-foreground truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Performance
                    </p>
                  </div>
                  <div className="p-4 space-y-0">
                    <div className="flex items-center justify-between py-2.5 border-b border-border/30">
                      <span className="text-[0.78rem] text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1.5">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-[0.84rem] font-bold text-amber-400">
                          {selectedDriver.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-border/30">
                      <span className="text-[0.78rem] text-muted-foreground">Total Trips</span>
                      <span className="text-[0.84rem] font-bold text-foreground">
                        {selectedDriver.totalTrips}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[0.78rem] text-muted-foreground">Assigned Vehicle</span>
                      {selectedDriver.vehicleAssigned ? (
                        <div className="flex items-center gap-1.5">
                          <Truck size={12} className="text-primary" />
                          <span className="text-[0.82rem] font-semibold text-foreground">
                            {selectedDriver.vehicleAssigned}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[0.78rem] text-muted-foreground/60 italic">None</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedDriver(null)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Edit size={13} /> Edit Driver
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}