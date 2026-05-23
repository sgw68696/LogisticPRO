'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Save, RotateCcw, Globe, Clock,
  DollarSign, Bell, ToggleLeft,
  Database, RefreshCw, MapPin,
  Languages, Ruler, Weight,
  Sun, Moon, Monitor,
} from 'lucide-react';

interface GeneralSettings {
  appName: string;
  tagline: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

interface RegionalSettings {
  defaultCountry: string;
  language: string;
  measurementUnit: string;
  weightUnit: string;
  temperatureUnit: string;
}

interface NotificationDefaults {
  defaultChannels: string[];
  quietHoursStart: string;
  quietHoursEnd: string;
  maxNotificationsPerDay: number;
  emailDigest: boolean;
}

interface FeatureToggles {
  allowRegistration: boolean;
  enableSSO: boolean;
  enableAPIAccess: boolean;
  requireTwoFactor: boolean;
  auditLogging: boolean;
  maintenanceMode: boolean;
  autoArchive: boolean;
}

interface DataRetention {
  logRetentionDays: number;
  archiveAfterDays: number;
  autoDeleteAfterDays: number;
  retentionEnabled: boolean;
}

const TIMEZONES = ['UTC (UTC+0)', 'IST (UTC+5:30)', 'EST (UTC-5)', 'PST (UTC-8)', 'CET (UTC+1)', 'AEST (UTC+10)'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)', 'AUD (A$)'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese'];
const MEASUREMENT_UNITS = ['Metric (kg, km)', 'Imperial (lb, mi)'];
const WEIGHT_UNITS = ['kg', 'lbs', 'tons', 'tonnes'];
const TIME_FORMATS = ['12-hour', '24-hour'];

export default function SystemSettingsPage() {
  const [general, setGeneral] = useState<GeneralSettings>({
    appName: 'LogisticPRO', tagline: 'Enterprise Logistics Management Platform',
    supportEmail: 'support@logisticpro.com', timezone: 'IST (UTC+5:30)',
    dateFormat: 'DD/MM/YYYY', timeFormat: '24-hour', currency: 'INR (₹)',
  });

  const [regional, setRegional] = useState<RegionalSettings>({
    defaultCountry: 'India', language: 'English',
    measurementUnit: 'Metric (kg, km)', weightUnit: 'kg', temperatureUnit: 'Celsius',
  });

  const [notifDefaults, setNotifDefaults] = useState<NotificationDefaults>({
    defaultChannels: ['Email', 'Push', 'In-App'],
    quietHoursStart: '22:00', quietHoursEnd: '07:00',
    maxNotificationsPerDay: 50, emailDigest: false,
  });

  const [features, setFeatures] = useState<FeatureToggles>({
    allowRegistration: true, enableSSO: false, enableAPIAccess: true,
    requireTwoFactor: false, auditLogging: true, maintenanceMode: false, autoArchive: true,
  });

  const [retention, setRetention] = useState<DataRetention>({
    logRetentionDays: 90, archiveAfterDays: 365,
    autoDeleteAfterDays: 730, retentionEnabled: true,
  });

  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setDirty(false);
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
    setDirty(false);
  };

  return (
    <PageWrapper
      title="System Settings"
      description="Configure global system preferences and defaults"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs h-8">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button
            size="sm" onClick={handleSave}
            className="gap-1.5 text-xs h-8 text-white"
            style={{ background: dirty ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : undefined }}
            variant={dirty ? 'default' : 'outline'}
          >
            <Save className="w-3.5 h-3.5" /> {dirty ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* General Settings */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Application Name</label>
                <Input value={general.appName} onChange={e => { setGeneral(g => ({ ...g, appName: e.target.value })); markDirty(); }} className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tagline</label>
                <Input value={general.tagline} onChange={e => { setGeneral(g => ({ ...g, tagline: e.target.value })); markDirty(); }} className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Support Email</label>
                <Input value={general.supportEmail} onChange={e => { setGeneral(g => ({ ...g, supportEmail: e.target.value })); markDirty(); }} className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Timezone</label>
                <select value={general.timezone} onChange={e => { setGeneral(g => ({ ...g, timezone: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date Format</label>
                <select value={general.dateFormat} onChange={e => { setGeneral(g => ({ ...g, dateFormat: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Time Format</label>
                <select value={general.timeFormat} onChange={e => { setGeneral(g => ({ ...g, timeFormat: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {TIME_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Default Currency</label>
                <select value={general.currency} onChange={e => { setGeneral(g => ({ ...g, currency: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-sky-400" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">Regional Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Default Country</label>
                <select value={regional.defaultCountry} onChange={e => { setRegional(r => ({ ...r, defaultCountry: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {['India', 'United States', 'United Kingdom', 'Australia', 'Germany', 'Japan'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Language</label>
                <select value={regional.language} onChange={e => { setRegional(r => ({ ...r, language: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Measurement Unit</label>
                <select value={regional.measurementUnit} onChange={e => { setRegional(r => ({ ...r, measurementUnit: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {MEASUREMENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Weight Unit</label>
                <select value={regional.weightUnit} onChange={e => { setRegional(r => ({ ...r, weightUnit: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {WEIGHT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Temperature Unit</label>
                <select value={regional.temperatureUnit} onChange={e => { setRegional(r => ({ ...r, temperatureUnit: e.target.value })); markDirty(); }}
                  className="w-full h-9 px-3 rounded-lg text-xs border bg-muted/40 text-foreground border-border outline-none focus:border-primary/50">
                  {['Celsius', 'Fahrenheit'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Defaults */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">Notification Defaults</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Default Notification Channels</label>
                <div className="flex flex-wrap gap-2">
                  {['Email', 'Push', 'SMS', 'In-App'].map(ch => {
                    const active = notifDefaults.defaultChannels.includes(ch);
                    return (
                      <button key={ch} onClick={() => {
                        setNotifDefaults(n => ({
                          ...n,
                          defaultChannels: active ? n.defaultChannels.filter(c => c !== ch) : [...n.defaultChannels, ch],
                        }));
                        markDirty();
                      }}
                        className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
                      >{ch}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Max Notifications/Day</label>
                <Input type="number" value={notifDefaults.maxNotificationsPerDay}
                  onChange={e => { setNotifDefaults(n => ({ ...n, maxNotificationsPerDay: parseInt(e.target.value) || 0 })); markDirty(); }}
                  className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Quiet Hours Start</label>
                <Input type="time" value={notifDefaults.quietHoursStart}
                  onChange={e => { setNotifDefaults(n => ({ ...n, quietHoursStart: e.target.value })); markDirty(); }}
                  className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div>
                <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Quiet Hours End</label>
                <Input type="time" value={notifDefaults.quietHoursEnd}
                  onChange={e => { setNotifDefaults(n => ({ ...n, quietHoursEnd: e.target.value })); markDirty(); }}
                  className="h-9 text-xs bg-muted/40 border-border" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={notifDefaults.emailDigest} onCheckedChange={v => { setNotifDefaults(n => ({ ...n, emailDigest: v })); markDirty(); }} />
                <div>
                  <p className="text-[0.78rem] font-medium text-foreground">Email Digest</p>
                  <p className="text-[0.65rem] text-muted-foreground">Send daily digest instead of individual emails</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                <ToggleLeft className="w-4 h-4 text-success" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">Feature Toggles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'allowRegistration', label: 'Allow Registration', desc: 'Allow new companies to register themselves' },
                { key: 'enableSSO', label: 'Single Sign-On (SSO)', desc: 'Enable SSO authentication providers' },
                { key: 'enableAPIAccess', label: 'API Access', desc: 'Enable REST API endpoints for external integrations' },
                { key: 'requireTwoFactor', label: 'Require Two-Factor Auth', desc: 'Force all users to enable 2FA' },
                { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all system events and user actions' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to all non-admin users' },
                { key: 'autoArchive', label: 'Auto-Archive', desc: 'Automatically archive completed shipments after 30 days' },
              ].map(f => (
                <div key={f.key} className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-lg">
                  <div>
                    <p className="text-[0.78rem] font-medium text-foreground">{f.label}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{f.desc}</p>
                  </div>
                  <Switch
                    checked={features[f.key as keyof FeatureToggles]}
                    onCheckedChange={v => { setFeatures(feat => ({ ...feat, [f.key]: v })); markDirty(); }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-violet-400" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">Data Retention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Switch checked={retention.retentionEnabled} onCheckedChange={v => { setRetention(r => ({ ...r, retentionEnabled: v })); markDirty(); }} />
                <div>
                  <p className="text-[0.78rem] font-medium text-foreground">Enable Data Retention Policies</p>
                  <p className="text-[0.65rem] text-muted-foreground">Auto-cleanup old logs and data based on retention periods</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Log Retention (days)</label>
                  <Input type="number" value={retention.logRetentionDays} disabled={!retention.retentionEnabled}
                    onChange={e => { setRetention(r => ({ ...r, logRetentionDays: parseInt(e.target.value) || 0 })); markDirty(); }}
                    className="h-9 text-xs bg-muted/40 border-border" />
                </div>
                <div>
                  <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Archive After (days)</label>
                  <Input type="number" value={retention.archiveAfterDays} disabled={!retention.retentionEnabled}
                    onChange={e => { setRetention(r => ({ ...r, archiveAfterDays: parseInt(e.target.value) || 0 })); markDirty(); }}
                    className="h-9 text-xs bg-muted/40 border-border" />
                </div>
                <div>
                  <label className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Auto-Delete After (days)</label>
                  <Input type="number" value={retention.autoDeleteAfterDays} disabled={!retention.retentionEnabled}
                    onChange={e => { setRetention(r => ({ ...r, autoDeleteAfterDays: parseInt(e.target.value) || 0 })); markDirty(); }}
                    className="h-9 text-xs bg-muted/40 border-border" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
}
