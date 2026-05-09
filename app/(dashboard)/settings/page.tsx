"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  Building, User, Bell, Shield, Palette,
  Mail, Phone, MapPin, Save, Upload, Key,
  Smartphone, Moon, Sun, Monitor, Lock,
  LogOut, CheckCircle,
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
  disabled:opacity-50 disabled:cursor-not-allowed
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

// ── Section wrapper ──────────────────────────
function SettingsSection({
  title, description, children,
}: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-r from-muted/20 to-transparent">
        <h3 className="text-[0.92rem] font-bold font-display text-foreground tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-[0.75rem] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Divider ──────────────────────────────────
const Divider = () => <div className="border-t border-border/40 my-5" />;

// ── Toggle row ───────────────────────────────
function ToggleRow({
  icon, title, description, checked, onChange,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-center flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <p className="text-[0.84rem] font-semibold text-foreground">{title}</p>
          <p className="text-[0.74rem] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="flex-shrink-0"
      />
    </div>
  );
}

// ── Save button ──────────────────────────────
function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-2 mt-2 border-t border-border/40">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)] disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
      >
        {saving ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={13} /> Save Changes
          </>
        )}
      </button>
    </div>
  );
}

// ── User Avatar ──────────────────────────────
function UserAvatar({ name, size = "md" }: { name?: string; size?: "md" | "lg" | "xl" }) {
  const sizeMap = { md: "w-10 h-10 text-[0.78rem]", lg: "w-16 h-16 text-[1rem]", xl: "w-20 h-20 text-[1.1rem]" };
  const colors = [
    "from-sky-500 to-indigo-500", "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600",
  ];
  const n = name ?? "U";
  const color = colors[n.charCodeAt(0) % colors.length];
  const initials = n.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeMap[size]} rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white font-display bg-gradient-to-br ${color} shadow-[0_4px_14px_rgba(0,0,0,0.2)]`}>
      {initials}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [companySettings, setCompanySettings] = useState({
    name: "LogiTrack Solutions", email: "info@logitrack.com",
    phone: "+91 11 2345 6789", address: "123 Business Park, Sector 62",
    city: "Noida", state: "Uttar Pradesh",
    pincode: "201301", gstNumber: "09AAACL1234F1Z5", panNumber: "AAACL1234F",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsNotifications: true,
    pushNotifications: true, shipmentUpdates: true,
    deliveryAlerts: true, paymentReminders: true,
    systemAlerts: true, marketingEmails: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "system", compactMode: false, showAnimations: true,
  });

  const [regional, setRegional] = useState({
    language: "en", timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY", currency: "INR",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  const TABS = [
    { value: 'profile',       label: 'Profile',       icon: <User size={14} /> },
    { value: 'company',       label: 'Company',       icon: <Building size={14} /> },
    { value: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { value: 'appearance',    label: 'Appearance',    icon: <Palette size={14} /> },
    { value: 'security',      label: 'Security',      icon: <Shield size={14} /> },
  ];

  return (
    <PageWrapper
      title="Settings"
      description="Manage your account and application settings"
    >
      <Tabs defaultValue="profile" className="space-y-6">

        {/* ── Tab bar ── */}
        <div className="bg-card border border-border/60 rounded-xl p-1.5 shadow-soft inline-flex w-full overflow-x-auto">
          <TabsList className="bg-transparent border-0 p-0 h-auto gap-1 flex-nowrap w-full justify-start">
            {TABS.map(({ value, label, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="
                  flex items-center gap-1.5 px-4 py-2
                  text-[0.8rem] font-semibold rounded-[9px]
                  whitespace-nowrap flex-shrink-0
                  data-[state=active]:bg-primary/10
                  data-[state=active]:text-primary
                  data-[state=active]:border data-[state=active]:border-primary/20
                  data-[state=active]:shadow-none
                  text-muted-foreground
                  hover:text-foreground hover:bg-muted/40
                  transition-all duration-150
                "
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ══════════════════════════════════════
            Profile Tab
        ══════════════════════════════════════ */}
        <TabsContent value="profile" className="space-y-0 mt-0">
          <SettingsSection
            title="Profile Information"
            description="Update your personal information and profile picture."
          >
            {/* Avatar row */}
            <div className="flex items-center gap-5 mb-6 p-4 rounded-xl bg-muted/20 border border-border/40">
              <UserAvatar name={user?.name} size="xl" />
              <div>
                <p className="text-[0.88rem] font-bold text-foreground mb-0.5">{user?.name}</p>
                <p className="text-[0.76rem] text-muted-foreground mb-3">{user?.email}</p>
                <button className="flex items-center gap-2 px-3.5 py-2 rounded-[9px] text-[0.78rem] font-semibold bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150">
                  <Upload size={12} /> Change Photo
                </button>
                <p className="text-[0.68rem] text-muted-foreground/60 mt-1.5">JPG, GIF or PNG. Max 2MB.</p>
              </div>
            </div>

            <Divider />

            <div className="grid gap-4 md:grid-cols-2 mb-5">
              <div>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <input id="name" defaultValue={user?.name} className={inputCls} />
              </div>
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <input id="email" type="email" defaultValue={user?.email} className={inputCls} />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <input id="phone" defaultValue="+91 98765 43210" className={inputCls} />
              </div>
              <div>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <input id="role" defaultValue={user?.role} disabled className={inputCls} />
              </div>
            </div>

            <div className="mb-5">
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <textarea id="bio" placeholder="Tell us about yourself..." className={textareaCls} />
            </div>

            <SaveButton saving={saving} onClick={handleSave} />
          </SettingsSection>
        </TabsContent>

        {/* ══════════════════════════════════════
            Company Tab
        ══════════════════════════════════════ */}
        <TabsContent value="company" className="space-y-0 mt-0">
          <SettingsSection
            title="Company Information"
            description="Update your company details and business information."
          >
            <div className="grid gap-4 md:grid-cols-2 mb-5">
              {[
                { id: 'companyName',  label: 'Company Name',  key: 'name',  type: 'text' },
                { id: 'companyEmail', label: 'Company Email', key: 'email', type: 'email' },
                { id: 'companyPhone', label: 'Company Phone', key: 'phone', type: 'text' },
                { id: 'gstNumber',    label: 'GST Number',    key: 'gstNumber', type: 'text' },
              ].map(({ id, label, key, type }) => (
                <div key={id}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <input
                    id={id}
                    type={type}
                    value={companySettings[key as keyof typeof companySettings]}
                    onChange={e => setCompanySettings(p => ({ ...p, [key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            <Divider />

            <div className="mb-4">
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                value={companySettings.address}
                onChange={e => setCompanySettings(p => ({ ...p, address: e.target.value }))}
                className={textareaCls}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-5">
              {[
                { id: 'city',    label: 'City',    key: 'city' },
                { id: 'state',   label: 'State',   key: 'state' },
                { id: 'pincode', label: 'Pincode', key: 'pincode' },
              ].map(({ id, label, key }) => (
                <div key={id}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <input
                    id={id}
                    value={companySettings[key as keyof typeof companySettings]}
                    onChange={e => setCompanySettings(p => ({ ...p, [key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            <SaveButton saving={saving} onClick={handleSave} />
          </SettingsSection>
        </TabsContent>

        {/* ══════════════════════════════════════
            Notifications Tab
        ══════════════════════════════════════ */}
        <TabsContent value="notifications" className="space-y-5 mt-0">
          <SettingsSection
            title="Notification Channels"
            description="Choose how you want to receive notifications."
          >
            <div className="space-y-0">
              <ToggleRow
                icon={<Mail size={15} />}
                title="Email Notifications"
                description="Receive notifications via email"
                checked={notifications.emailNotifications}
                onChange={v => setNotifications(p => ({ ...p, emailNotifications: v }))}
              />
              <ToggleRow
                icon={<Smartphone size={15} />}
                title="SMS Notifications"
                description="Receive notifications via SMS"
                checked={notifications.smsNotifications}
                onChange={v => setNotifications(p => ({ ...p, smsNotifications: v }))}
              />
              <ToggleRow
                icon={<Bell size={15} />}
                title="Push Notifications"
                description="Receive push notifications in browser"
                checked={notifications.pushNotifications}
                onChange={v => setNotifications(p => ({ ...p, pushNotifications: v }))}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Notification Types"
            description="Control which events trigger notifications."
          >
            <div className="space-y-0">
              {[
                { key: 'shipmentUpdates',  title: 'Shipment Updates',   desc: 'Status changes for shipments' },
                { key: 'deliveryAlerts',   title: 'Delivery Alerts',    desc: 'Delivery confirmations and issues' },
                { key: 'paymentReminders', title: 'Payment Reminders',  desc: 'Invoice and payment notifications' },
                { key: 'systemAlerts',     title: 'System Alerts',      desc: 'Important system notifications' },
                { key: 'marketingEmails',  title: 'Marketing Emails',   desc: 'Product updates and promotions' },
              ].map(({ key, title, desc }) => (
                <ToggleRow
                  key={key}
                  title={title}
                  description={desc}
                  checked={notifications[key as keyof typeof notifications] as boolean}
                  onChange={v => setNotifications(p => ({ ...p, [key]: v }))}
                />
              ))}
            </div>
            <SaveButton saving={saving} onClick={handleSave} />
          </SettingsSection>
        </TabsContent>

        {/* ══════════════════════════════════════
            Appearance Tab
        ══════════════════════════════════════ */}
        <TabsContent value="appearance" className="space-y-5 mt-0">
          <SettingsSection
            title="Theme"
            description="Choose your preferred color scheme."
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light',  label: 'Light',  icon: <Sun size={22} /> },
                { value: 'dark',   label: 'Dark',   icon: <Moon size={22} /> },
                { value: 'system', label: 'System', icon: <Monitor size={22} /> },
              ].map(({ value, label, icon }) => {
                const isActive = appearance.theme === value;
                return (
                  <button
                    key={value}
                    onClick={() => setAppearance(p => ({ ...p, theme: value }))}
                    className={`
                      flex flex-col items-center gap-2.5 py-5 rounded-xl
                      border text-[0.82rem] font-semibold
                      transition-all duration-200
                      ${isActive
                        ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_0_2px_oklch(var(--primary)/0.15)]'
                        : 'bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                      {icon}
                    </span>
                    {label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Interface"
            description="Adjust layout density and animation preferences."
          >
            <div className="space-y-0">
              <ToggleRow
                title="Compact Mode"
                description="Use smaller spacing and fonts throughout the app"
                checked={appearance.compactMode}
                onChange={v => setAppearance(p => ({ ...p, compactMode: v }))}
              />
              <ToggleRow
                title="Show Animations"
                description="Enable UI animations and smooth transitions"
                checked={appearance.showAnimations}
                onChange={v => setAppearance(p => ({ ...p, showAnimations: v }))}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Regional Settings"
            description="Set your language, timezone, and format preferences."
          >
            <div className="grid gap-4 md:grid-cols-2 mb-5">
              <div>
                <FieldLabel>Language</FieldLabel>
                <Select value={regional.language} onValueChange={v => setRegional(p => ({ ...p, language: v }))}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    <SelectItem value="en" className="text-[0.82rem]">English</SelectItem>
                    <SelectItem value="hi" className="text-[0.82rem]">Hindi</SelectItem>
                    <SelectItem value="mr" className="text-[0.82rem]">Marathi</SelectItem>
                    <SelectItem value="ta" className="text-[0.82rem]">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Timezone</FieldLabel>
                <Select value={regional.timezone} onValueChange={v => setRegional(p => ({ ...p, timezone: v }))}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    <SelectItem value="Asia/Kolkata" className="text-[0.82rem]">India Standard Time (IST)</SelectItem>
                    <SelectItem value="UTC" className="text-[0.82rem]">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Date Format</FieldLabel>
                <Select value={regional.dateFormat} onValueChange={v => setRegional(p => ({ ...p, dateFormat: v }))}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    <SelectItem value="DD/MM/YYYY" className="text-[0.82rem]">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY" className="text-[0.82rem]">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD" className="text-[0.82rem]">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Currency</FieldLabel>
                <Select value={regional.currency} onValueChange={v => setRegional(p => ({ ...p, currency: v }))}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    <SelectItem value="INR" className="text-[0.82rem]">Indian Rupee (INR)</SelectItem>
                    <SelectItem value="USD" className="text-[0.82rem]">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR" className="text-[0.82rem]">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SaveButton saving={saving} onClick={handleSave} />
          </SettingsSection>
        </TabsContent>

        {/* ══════════════════════════════════════
            Security Tab
        ══════════════════════════════════════ */}
        <TabsContent value="security" className="space-y-5 mt-0">

          {/* Change Password */}
          <SettingsSection
            title="Change Password"
            description="Update your password to keep your account secure."
          >
            <div className="space-y-4 mb-5">
              {[
                { id: 'currentPassword', label: 'Current Password' },
                { id: 'newPassword',     label: 'New Password' },
                { id: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <input id={id} type="password" className={inputCls} />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 mt-2 border-t border-border/40">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-[9px] text-[0.82rem] font-bold bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
              >
                <Key size={13} /> Update Password
              </button>
            </div>
          </SettingsSection>

          {/* Two-Factor Authentication */}
          <SettingsSection
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account."
          >
            <div className="space-y-0">
              {[
                {
                  icon: <Smartphone size={15} />,
                  title: 'Authenticator App',
                  desc: 'Use an authenticator app for 2FA',
                  iconColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                },
                {
                  icon: <Mail size={15} />,
                  title: 'Email Verification',
                  desc: 'Receive verification codes via email',
                  iconColor: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                },
              ].map(({ icon, title, desc, iconColor }) => (
                <div key={title} className="flex items-center justify-between gap-4 py-4 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-[0.84rem] font-semibold text-foreground">{title}</p>
                      <p className="text-[0.74rem] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-[8px] text-[0.78rem] font-bold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-all duration-150">
                    Enable
                  </button>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Active Sessions */}
          <SettingsSection
            title="Active Sessions"
            description="Manage devices where you are currently logged in."
          >
            {/* Current session */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/15 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                  <Monitor size={15} />
                </div>
                <div>
                  <p className="text-[0.84rem] font-semibold text-foreground">Current Device</p>
                  <p className="text-[0.74rem] text-muted-foreground">Chrome on Windows · Active now</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Current
              </span>
            </div>

            {/* Sign out all */}
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[0.82rem] font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-200">
              <LogOut size={13} /> Sign Out All Other Devices
            </button>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}