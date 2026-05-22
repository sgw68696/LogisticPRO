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
  Shield, Lock, Key, Eye, EyeOff,
  Smartphone, Globe, Clock, Users,
  AlertTriangle, CheckCircle, XCircle,
  Plus, Trash2, Save, RotateCcw,
  Fingerprint, Server, Activity,
} from 'lucide-react';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  preventReuse: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

interface TwoFactorSettings {
  enabled: boolean;
  enforced: boolean;
  methods: ('app' | 'sms' | 'email')[];
  gracePeriodDays: number;
  rememberDevice: boolean;
  rememberDays: number;
}

interface SessionConfig {
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  extendOnActivity: boolean;
  forceReauthOnIpChange: boolean;
  idleWarningMinutes: number;
}

interface WhitelistEntry {
  id: string;
  ip: string;
  description: string;
  created: string;
  status: 'active' | 'inactive';
}

export default function SecuritySettingsPage() {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 12, requireUppercase: true, requireLowercase: true,
    requireNumbers: true, requireSpecialChars: true, expiryDays: 90,
    preventReuse: 5, maxLoginAttempts: 5, lockoutDurationMinutes: 30,
  });

  const [twoFactor, setTwoFactor] = useState<TwoFactorSettings>({
    enabled: true, enforced: false,
    methods: ['app', 'sms'], gracePeriodDays: 7,
    rememberDevice: true, rememberDays: 30,
  });

  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    sessionTimeoutMinutes: 60, maxConcurrentSessions: 3,
    extendOnActivity: true, forceReauthOnIpChange: true,
    idleWarningMinutes: 5,
  });

  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([
    { id: 'wl-001', ip: '192.168.1.0/24', description: 'Corporate Office Bangalore', created: '2025-01-10T00:00:00Z', status: 'active' },
    { id: 'wl-002', ip: '10.0.0.0/8', description: 'Internal VPN', created: '2025-01-10T00:00:00Z', status: 'active' },
    { id: 'wl-003', ip: '203.0.113.0/24', description: 'Remote Office Delhi', created: '2025-02-15T00:00:00Z', status: 'inactive' },
  ]);

  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggle2FAMethod = (method: 'app' | 'sms' | 'email') => {
    setTwoFactor(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method],
    }));
  };

  const addWhitelistEntry = () => {
    if (!newIp.trim()) return;
    setWhitelist(prev => [...prev, {
      id: `wl-${Date.now()}`,
      ip: newIp.trim(),
      description: newDesc.trim() || 'No description',
      created: new Date().toISOString(),
      status: 'active',
    }]);
    setNewIp('');
    setNewDesc('');
    toast.success('IP whitelist entry added');
  };

  const removeWhitelistEntry = (id: string) => {
    setWhitelist(prev => prev.filter(e => e.id !== id));
    toast.success('IP whitelist entry removed');
  };

  const toggleWhitelistStatus = (id: string) => {
    setWhitelist(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' as const } : e));
  };

  const handleSave = () => {
    toast.success('Security settings saved successfully');
  };

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <PageWrapper
      title="Security Settings"
      description="Configure platform-wide security policies, authentication, and access control"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2"><RotateCcw className="w-4 h-4" />Reset</Button>
          <Button className="h-9 gap-2" onClick={handleSave} style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            <Save className="w-4 h-4" />Save Changes
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Security Score', value: 'B+', desc: 'Good — 3 improvements available', icon: Shield, color: 'text-amber-400' },
          { label: 'Active Sessions', value: '1,247', desc: 'Across all users', icon: Users, color: 'text-sky-400' },
          { label: 'Recent Security Events', value: '12', desc: 'In the last 24 hours', icon: AlertTriangle, color: 'text-red-400' },
        ].map(item => (
          <div key={item.label} className="bg-card border border-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</p>
              <item.icon className={cn('w-4 h-4', item.color)} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Lock} title="Password Policy" description="Define password complexity requirements and expiration rules" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Minimum Length</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={passwordPolicy.minLength}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) || 8 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">characters</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Expiry Period</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={passwordPolicy.expiryDays}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 0 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Prevent Reuse</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={passwordPolicy.preventReuse}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, preventReuse: parseInt(e.target.value) || 0 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">last passwords</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Max Login Attempts</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={passwordPolicy.maxLoginAttempts}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 3 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">before lockout</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Lockout Duration</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={passwordPolicy.lockoutDurationMinutes}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, lockoutDurationMinutes: parseInt(e.target.value) || 15 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: 'requireUppercase', label: 'Uppercase (A-Z)' },
                { key: 'requireLowercase', label: 'Lowercase (a-z)' },
                { key: 'requireNumbers', label: 'Numbers (0-9)' },
                { key: 'requireSpecialChars', label: 'Special (!@#$%)' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                  <Switch
                    checked={passwordPolicy[item.key as keyof PasswordPolicy] as boolean}
                    onCheckedChange={() => setPasswordPolicy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof PasswordPolicy] }))}
                  />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Fingerprint} title="Two-Factor Authentication" description="Manage 2FA requirements and available methods" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow users to set up two-factor authentication</p>
                  </div>
                  <Switch checked={twoFactor.enabled} onCheckedChange={v => setTwoFactor(prev => ({ ...prev, enabled: v }))} />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enforce 2FA</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Require all users to configure 2FA</p>
                  </div>
                  <Switch checked={twoFactor.enforced} onCheckedChange={v => setTwoFactor(prev => ({ ...prev, enforced: v }))} />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Remember Device</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Skip 2FA on trusted devices</p>
                  </div>
                  <Switch checked={twoFactor.rememberDevice} onCheckedChange={v => setTwoFactor(prev => ({ ...prev, rememberDevice: v }))} />
                </label>
              </div>
              <div className="space-y-4">
                <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Available Methods</p>
                {(['app', 'sms', 'email'] as const).map(method => (
                  <label key={method} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                    <Switch
                      checked={twoFactor.methods.includes(method)}
                      onCheckedChange={() => toggle2FAMethod(method)}
                      disabled={!twoFactor.enabled}
                    />
                    <div className="flex items-center gap-2">
                      {method === 'app' ? <Smartphone className="w-4 h-4 text-sky-400" /> : method === 'sms' ? <Globe className="w-4 h-4 text-green-400" /> : <Key className="w-4 h-4 text-amber-400" />}
                      <span className="text-xs font-medium text-foreground capitalize">{method === 'app' ? 'Authenticator App' : method === 'sms' ? 'SMS Code' : 'Email Code'}</span>
                    </div>
                  </label>
                ))}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10">
                  <span className="text-xs text-muted-foreground">Grace Period:</span>
                  <Input
                    type="number"
                    value={twoFactor.gracePeriodDays}
                    onChange={e => setTwoFactor(prev => ({ ...prev, gracePeriodDays: parseInt(e.target.value) || 0 }))}
                    className="w-16 h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">days before enforcement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Clock} title="Session Management" description="Configure session timeouts, concurrency limits, and idle behavior" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Session Timeout</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={sessionConfig.sessionTimeoutMinutes}
                    onChange={e => setSessionConfig(prev => ({ ...prev, sessionTimeoutMinutes: parseInt(e.target.value) || 30 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">minutes</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Max Concurrent Sessions</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={sessionConfig.maxConcurrentSessions}
                    onChange={e => setSessionConfig(prev => ({ ...prev, maxConcurrentSessions: parseInt(e.target.value) || 1 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">sessions per user</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Idle Warning</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    type="number"
                    value={sessionConfig.idleWarningMinutes}
                    onChange={e => setSessionConfig(prev => ({ ...prev, idleWarningMinutes: parseInt(e.target.value) || 5 }))}
                    className="w-20 h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">minutes before timeout</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Extend on Activity</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reset timeout on user activity</p>
                </div>
                <Switch checked={sessionConfig.extendOnActivity} onCheckedChange={v => setSessionConfig(prev => ({ ...prev, extendOnActivity: v }))} />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Re-auth on IP Change</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Require re-authentication on IP change</p>
                </div>
                <Switch checked={sessionConfig.forceReauthOnIpChange} onCheckedChange={v => setSessionConfig(prev => ({ ...prev, forceReauthOnIpChange: v }))} />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* IP Whitelist */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Globe} title="IP Whitelist" description="Restrict access to trusted IP addresses and networks" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <Input
                placeholder="IP or CIDR (e.g. 192.168.1.0/24)"
                value={newIp}
                onChange={e => setNewIp(e.target.value)}
                className="h-9 flex-1 text-xs font-mono"
              />
              <Input
                placeholder="Description (optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="h-9 w-[200px] text-xs"
              />
              <Button onClick={addWhitelistEntry} className="h-9 gap-2" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                <Plus className="w-4 h-4" />Add Entry
              </Button>
            </div>
            <div className="divide-y divide-border/30 border border-border/40 rounded-lg overflow-hidden">
              {whitelist.map(entry => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      entry.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted-foreground',
                    )}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-medium text-foreground">{entry.ip}</p>
                      <p className="text-xs text-muted-foreground">{entry.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', entry.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/30 text-muted-foreground border-border/40')}>
                      {entry.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWhitelistStatus(entry.id)}
                      className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {entry.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWhitelistEntry(entry.id)}
                      className="w-7 h-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Activity} title="Rate Limiting & API Security" description="Configure API rate limits and brute force protection" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'API Requests/Min', value: 60, key: 'apiRate' },
                { label: 'Login Attempts/Min', value: 10, key: 'loginRate' },
                { label: 'OTP Requests/Hour', value: 5, key: 'otpRate' },
              ].map(item => (
                <div key={item.key}>
                  <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Input type="number" defaultValue={item.value} className="w-20 h-9 text-sm" />
                    <span className="text-xs text-muted-foreground">per {item.key.includes('Hour') ? 'hour' : 'minute'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-muted/10">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Recommended:</span> Enable rate limiting to prevent brute force attacks and API abuse. Current settings provide a good balance between security and usability.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Audit Log */}
        <Card>
          <CardHeader>
            <SectionHeader icon={Server} title="Audit Configuration" description="Configure what events are logged and retention policies" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Log Retention</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input type="number" defaultValue={90} className="w-20 h-9 text-sm" />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">Audit Log Level</label>
                <div className="mt-1.5">
                  <select className="w-full h-9 rounded-lg border border-border/40 bg-background text-sm text-foreground px-3">
                    <option>Verbose (log all events)</option>
                    <option>Standard (log security & access events)</option>
                    <option>Minimal (log only critical events)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'logAuth', label: 'Authentication Events', default: true },
                { key: 'logAccess', label: 'Access Logs', default: true },
                { key: 'logApi', label: 'API Calls', default: false },
                { key: 'logData', label: 'Data Changes', default: true },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10 cursor-pointer">
                  <Switch defaultChecked={item.default} />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
