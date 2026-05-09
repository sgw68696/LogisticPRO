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
import { getUsers, createUser, deleteUser } from "@/services/userService";
import { type User } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import {
  Plus, Search, SlidersHorizontal, MoreHorizontal,
  Users, Eye, Edit, Trash2,
  Mail, Phone, Shield, UserCheck, Key,
} from "lucide-react";

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

// ── Role config ──────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; dot: string }> = {
  Admin:      { color: 'bg-red-500/10 border-red-500/20 text-red-400',     dot: 'bg-red-400' },
  Manager:    { color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',     dot: 'bg-sky-400' },
  Dispatcher: { color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  Staff:      { color: 'bg-muted/60 border-border/60 text-muted-foreground', dot: 'bg-muted-foreground' },
};

const getRoleConfig = (role: string) => ROLE_CONFIG[role] ?? ROLE_CONFIG.Staff;

function RoleBadge({ role }: { role: string }) {
  const { color } = getRoleConfig(role);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold border ${color}`}>
      <Shield size={9} />
      {role}
    </span>
  );
}

// ── User Avatar ──────────────────────────────
function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8 text-[0.68rem]",
    md: "w-10 h-10 text-[0.78rem]",
    lg: "w-14 h-14 text-[1rem]",
  };
  const colors = [
    "from-sky-500 to-indigo-500", "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500", "from-cyan-500 to-sky-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`
      ${sizeMap[size]} rounded-xl flex-shrink-0
      flex items-center justify-center
      font-bold text-white font-display
      bg-gradient-to-br ${color}
      shadow-[0_2px_8px_rgba(0,0,0,0.18)]
    `}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    role: "Staff" as User["role"],
    username: "",
    status: "Active" as User["status"],
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    setUsers(await getUsers());
    setLoading(false);
  };

  const handleAddUser = async () => {
    await createUser({
      ...formData,
      username: formData.username || formData.email.split("@")[0],
    });
    setIsAddDialogOpen(false);
    setFormData({ name: "", email: "", phone: "", role: "Staff", username: "", status: "Active" });
    loadUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(id);
    loadUsers();
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === "all" || u.role === roleFilter) &&
      (statusFilter === "all" || u.status === statusFilter)
    );
  });

  const statsData = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <Users size={18} />,
      color: 'bg-primary/10 border-primary/15 text-primary',
      valueColor: 'text-foreground',
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.status === "Active").length,
      icon: <UserCheck size={18} />,
      color: 'bg-green-500/10 border-green-500/15 text-green-400',
      valueColor: 'text-green-400',
    },
    {
      label: 'Admins',
      value: users.filter(u => u.role === "Admin").length,
      icon: <Shield size={18} />,
      color: 'bg-red-500/10 border-red-500/15 text-red-400',
      valueColor: 'text-red-400',
    },
    {
      label: 'Managers',
      value: users.filter(u => u.role === "Manager").length,
      icon: <UserCheck size={18} />,
      color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
      valueColor: 'text-sky-400',
    },
  ];

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={item.name} size="md" />
          <div>
            <p className="text-[0.84rem] font-bold text-foreground">{item.name}</p>
            <p className="text-[0.73rem] text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (item) => <RoleBadge role={item.role} />,
    },
    {
      key: "username",
      header: "Username",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[0.8rem] text-primary font-bold">
          @{item.username}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground">
          <Phone size={11} className="flex-shrink-0" />
          <span>{item.phone || "N/A"}</span>
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
      key: "lastLogin",
      header: "Last Login",
      sortable: true,
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground">
          {item.lastLogin ? formatDate(item.lastLogin) : "Never"}
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
              onClick={() => setSelectedUser(item)}
            >
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Key size={13} /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[0.82rem] gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
              onClick={() => handleDeleteUser(item.id)}
            >
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <PageWrapper title="User Management" description="Manage system users">
      <SkeletonLoader variant="table" count={10} />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="User Management"
      description="Manage system users and permissions"
      actions={
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display hover:-translate-y-px transition-all duration-200 hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} /> Add User
        </button>
      }
    >
      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {statsData.map(({ label, value, icon, color, valueColor }) => (
          <div
            key={label}
            className="group relative bg-card border border-border/60 rounded-xl p-5 shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_28px_oklch(var(--primary)/0.08)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
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

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Admin', 'Manager', 'Dispatcher', 'Staff'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Roles' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Active', 'Inactive'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Status' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </span>
            <button
              onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}
              className="text-[0.72rem] font-semibold text-primary hover:text-primary/70 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable data={filteredUsers} columns={columns} pageSize={10} emptyMessage="No users found" />

      {/* ── Add User Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with appropriate permissions.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
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
                  placeholder="user@email.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
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
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={v => setFormData(p => ({ ...p, role: v as User["role"] }))}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    {['Admin', 'Manager', 'Dispatcher', 'Staff'].map(r => (
                      <SelectItem key={r} value={r} className="text-[0.82rem]">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <input
                  id="username"
                  placeholder="e.g., johndoe"
                  value={formData.username}
                  onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={v => setFormData(p => ({ ...p, status: v as User["status"] }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="Active" className="text-[0.82rem]">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-[0.82rem]">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
              onClick={handleAddUser}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Add User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User Detail Dialog ── */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <DialogBody className="space-y-5">

              {/* Hero row */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent">
                <UserAvatar name={selectedUser.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[1rem] font-extrabold font-display text-foreground tracking-tight">
                    {selectedUser.name}
                  </h3>
                  <p className="font-mono text-[0.78rem] text-primary font-bold mt-0.5">
                    @{selectedUser.username}
                  </p>
                </div>
                <RoleBadge role={selectedUser.role} />
              </div>

              {/* Contact info rows */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                    Contact & Account
                  </p>
                </div>
                <div className="p-4 space-y-0">
                  {[
                    {
                      icon: <Mail size={12} />,
                      text: selectedUser.email,
                      color: 'bg-indigo-500/10 text-indigo-400',
                    },
                    {
                      icon: <Phone size={12} />,
                      text: selectedUser.phone || "N/A",
                      color: 'bg-sky-500/10 text-sky-400',
                    },
                    {
                      icon: <Shield size={12} />,
                      text: selectedUser.role,
                      color: getRoleConfig(selectedUser.role).color.split(' ').slice(0, 2).join(' '),
                    },
                  ].map(({ icon, text, color }, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
                        {icon}
                      </div>
                      <span className="text-[0.82rem] text-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Created', value: formatDate(selectedUser.createdAt) },
                  {
                    label: 'Last Login',
                    value: selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/30 border border-border/40 rounded-xl px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-[0.82rem] font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border border-border/40 rounded-xl">
                <span className="text-[0.78rem] text-muted-foreground font-medium">Account Status</span>
                <StatusBadge status={selectedUser.status} />
              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Edit size={13} /> Edit User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}