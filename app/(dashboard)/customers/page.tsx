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
import { getCustomers, createCustomer, deleteCustomer } from "@/services/customerService";
import { type Customer } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, Search, SlidersHorizontal, MoreHorizontal,
  Users, Phone, Mail, MapPin, Eye, Edit, Trash2,
  Building, User, Package, IndianRupee,
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

const textareaCls = `
  w-full px-3 py-2.5 min-h-[80px]
  bg-muted/40 border border-border
  rounded-[9px] text-[0.84rem] text-foreground
  outline-none placeholder:text-muted-foreground resize-none
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

// ── Customer avatar ─────────────────────────
function CustomerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-8 h-8 text-[0.68rem]", md: "w-10 h-10 text-[0.78rem]", lg: "w-14 h-14 text-[1rem]" };
  const colors = [
    "from-sky-500 to-indigo-500", "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500", "from-cyan-500 to-sky-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeMap[size]} rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white font-display bg-gradient-to-br ${color} shadow-[0_2px_8px_rgba(0,0,0,0.18)]`}>
      {initials}
    </div>
  );
}

// ── Type badge ──────────────────────────────
function TypeBadge({ type }: { type: Customer["type"] }) {
  const isBusiness = type === "Business";
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1
      rounded-full text-[0.7rem] font-bold border
      ${isBusiness
        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
        : 'bg-muted/60 border-border/60 text-muted-foreground'
      }
    `}>
      {isBusiness ? <Building size={10} /> : <User size={10} />}
      {type}
    </span>
  );
}

// ── Stat cards config ───────────────────────
const buildStats = (
  total: number, business: number,
  shipments: number, outstanding: number
) => [
  {
    label: 'Total Customers', value: total,
    icon: <Users size={18} />,
    color: 'bg-primary/10 border-primary/15 text-primary',
    valueColor: 'text-foreground',
  },
  {
    label: 'Business Accounts', value: business,
    icon: <Building size={18} />,
    color: 'bg-indigo-500/10 border-indigo-500/15 text-indigo-400',
    valueColor: 'text-indigo-400',
  },
  {
    label: 'Total Shipments', value: shipments,
    icon: <Package size={18} />,
    color: 'bg-green-500/10 border-green-500/15 text-green-400',
    valueColor: 'text-green-400',
  },
  {
    label: 'Outstanding', value: formatCurrency(outstanding),
    icon: <IndianRupee size={18} />,
    color: outstanding > 0
      ? 'bg-amber-500/10 border-amber-500/15 text-amber-400'
      : 'bg-green-500/10 border-green-500/15 text-green-400',
    valueColor: outstanding > 0 ? 'text-amber-400' : 'text-green-400',
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    type: "Individual" as Customer["type"],
    city: "", address: "",
  });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      setCustomers(await getCustomers());
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createCustomer({
        name: formData.name, email: formData.email,
        phone: formData.phone, type: formData.type,
        city: formData.city, address: formData.address,
        totalShipments: 0, outstandingBalance: 0,
        createdAt: new Date().toISOString(), slaContract: null,
      });
      toast.success("Customer added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", type: "Individual", city: "", address: "" });
      loadCustomers();
    } catch {
      toast.error("Failed to add customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
      loadCustomers();
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)) &&
      (typeFilter === "all" || c.type === typeFilter)
    );
  });

  const totalShipments = customers.reduce((s, c) => s + c.totalShipments, 0);
  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0);
  const businessCustomers = customers.filter(c => c.type === "Business").length;
  const stats = buildStats(customers.length, businessCustomers, totalShipments, totalOutstanding);

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar name={item.name} size="md" />
          <div>
            <p className="text-[0.84rem] font-bold text-foreground">{item.name}</p>
            <p className="text-[0.73rem] text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => <TypeBadge type={item.type} />,
    },
    {
      key: "phone",
      header: "Contact",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground">
          <Phone size={11} className="flex-shrink-0" />
          <span>{item.phone}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground">
          <MapPin size={11} className="flex-shrink-0" />
          <span>{item.city}</span>
        </div>
      ),
    },
    {
      key: "totalShipments",
      header: "Shipments",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Package size={12} className="text-primary flex-shrink-0" />
          <span className="text-[0.84rem] font-bold text-foreground">{item.totalShipments}</span>
        </div>
      ),
    },
    {
      key: "outstandingBalance",
      header: "Outstanding",
      sortable: true,
      render: (item) => (
        <span className={`text-[0.84rem] font-bold ${
          item.outstandingBalance > 0 ? 'text-amber-400' : 'text-muted-foreground'
        }`}>
          {formatCurrency(item.outstandingBalance)}
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
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/40 border border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="nb-dropdown w-44">
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer"
              onClick={e => { e.stopPropagation(); setSelectedCustomer(item); }}
            >
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
              onClick={e => { e.stopPropagation(); handleDeleteCustomer(item.id); }}
            >
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <PageWrapper title="Customer Management" description="Manage your customers">
      <SkeletonLoader variant="table" count={10} />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Customer Management"
      description="Manage your customers and their information"
      actions={
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display hover:-translate-y-px transition-all duration-200 hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} /> Add Customer
        </button>
      }
    >
      {/* ── Stat Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {stats.map(({ label, value, icon, color, valueColor }) => (
          <div
            key={label}
            className="group relative bg-card border border-border/60 rounded-xl p-5 shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_28px_oklch(var(--primary)/0.08)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-2">
                  {label}
                </p>
                <p className={`text-[1.85rem] font-extrabold font-display leading-none ${valueColor}`}>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Individual', 'Business'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Types' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery || typeFilter !== 'all') && (
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        pageSize={10}
        emptyMessage="No customers found"
      />

      {/* ── Add Customer Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the details for the new customer.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                <input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>Type</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={v => setFormData(p => ({ ...p, type: v as Customer["type"] }))}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    <SelectItem value="Individual" className="text-[0.82rem]">Individual</SelectItem>
                    <SelectItem value="Business" className="text-[0.82rem]">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                <input
                  id="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={textareaCls}
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
              onClick={handleAddCustomer}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Add Customer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Customer Detail Dialog ── */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              {selectedCustomer && selectedCustomer.email}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <DialogBody className="space-y-5">

              {/* Hero row */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent">
                <CustomerAvatar name={selectedCustomer.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[1rem] font-extrabold font-display text-foreground tracking-tight">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-[0.78rem] text-muted-foreground mt-0.5">{selectedCustomer.email}</p>
                </div>
                <TypeBadge type={selectedCustomer.type} />
              </div>

              {/* Info grid */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Contact info */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Contact Information
                    </p>
                  </div>
                  <div className="p-4 space-y-0">
                    {[
                      { icon: <Phone size={12} />, text: selectedCustomer.phone, color: 'bg-sky-500/10 text-sky-400' },
                      { icon: <Mail size={12} />, text: selectedCustomer.email, color: 'bg-indigo-500/10 text-indigo-400' },
                      { icon: <MapPin size={12} />, text: `${selectedCustomer.address}, ${selectedCustomer.city}`, color: 'bg-muted/60 text-muted-foreground' },
                    ].map(({ icon, text, color }, i) => (
                      <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                          {icon}
                        </div>
                        <span className="text-[0.82rem] text-foreground leading-relaxed">{text}</span>
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
                    <div className="flex items-center justify-between py-2.5 border-b border-border/30">
                      <span className="text-[0.78rem] text-muted-foreground">Total Shipments</span>
                      <div className="flex items-center gap-1.5">
                        <Package size={12} className="text-primary" />
                        <span className="text-[0.84rem] font-bold text-foreground">
                          {selectedCustomer.totalShipments}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <span className="text-[0.78rem] text-muted-foreground">Outstanding Balance</span>
                      <span className={`text-[0.84rem] font-bold ${
                        selectedCustomer.outstandingBalance > 0 ? 'text-amber-400' : 'text-muted-foreground'
                      }`}>
                        {formatCurrency(selectedCustomer.outstandingBalance)}
                      </span>
                    </div>
                    {selectedCustomer.slaContract && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-[0.78rem] text-muted-foreground">SLA Contract</span>
                        <span className="text-[0.82rem] font-semibold text-foreground">
                          {selectedCustomer.slaContract}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Edit size={13} /> Edit Customer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}