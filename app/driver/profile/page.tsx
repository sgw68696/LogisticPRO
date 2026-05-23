'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { mockDrivers } from '@/data/mockData';
import { toast } from 'sonner';
import {
  User, Phone, Mail, Truck, Star,
  Calendar, Shield, Award, FileText,
  CheckCircle2, XCircle, Save, Edit,
  MapPin, Clock, IdCard,
} from 'lucide-react';

const DRIVER_ID = 'drv-001';

export default function DriverProfilePage() {
  const driver = mockDrivers.find(d => d.id === DRIVER_ID)!;

  const [name] = useState(driver.name);
  const [email] = useState(driver.email);
  const [phone] = useState(driver.phone);

  const handleSave = () => {
    toast.success('Profile saved');
  };

  return (
    <PageWrapper
      title="My Profile"
      description="View and manage your driver profile"
      actions={
        <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs h-8 text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          <Save className="w-3.5 h-3.5" /> Save Changes
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-[1.02rem] font-bold font-display text-foreground">{driver.name}</h2>
              <p className="text-[0.72rem] text-muted-foreground mt-0.5">{driver.driverId}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(driver.rating) ? 'text-amber-400' : 'text-muted-foreground/20'}`}
                    fill={i < Math.floor(driver.rating) ? 'currentColor' : 'none'} />
                ))}
                <span className="text-[0.72rem] text-muted-foreground ml-1.5">{driver.rating} rating</span>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Badge variant="outline" className="text-[0.6rem] px-2 py-0.5 h-auto bg-success/10 text-success border-success/20 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {driver.status}
                </Badge>
                <Badge variant="outline" className="text-[0.6rem] px-2 py-0.5 h-auto bg-muted/40 text-muted-foreground border-border/40 gap-1">
                  <Truck className="w-3 h-3" />
                  {driver.vehicleAssigned || 'Unassigned'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardContent className="p-4 space-y-3">
              {[
                { icon: Award, label: 'Total Trips', value: driver.totalTrips.toString() },
                { icon: Calendar, label: 'Joined', value: new Date(driver.joinDate).toLocaleDateString() },
                { icon: Shield, label: 'License', value: driver.licenseNumber },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-[0.78rem] font-medium text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Personal Info + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-[0.92rem] font-bold font-display flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <Input value={name} className="h-9 text-xs bg-muted/40 border-border" readOnly />
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Driver ID</label>
                  <Input value={driver.driverId} className="h-9 text-xs bg-muted/40 border-border font-mono" readOnly />
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
                  <Input value={email} onChange={e => {}} className="h-9 text-xs bg-muted/40 border-border" />
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Phone</label>
                  <Input value={phone} onChange={e => {}} className="h-9 text-xs bg-muted/40 border-border" />
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">License Number</label>
                  <Input value={driver.licenseNumber} className="h-9 text-xs bg-muted/40 border-border font-mono" readOnly />
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Assigned Vehicle</label>
                  <Input value={driver.vehicleAssigned || 'None'} className="h-9 text-xs bg-muted/40 border-border font-mono" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-[0.92rem] font-bold font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {driver.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${doc.verified ? 'bg-success/10 border-success/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <FileText className={`w-4 h-4 ${doc.verified ? 'text-success' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <p className="text-[0.78rem] font-medium text-foreground">{doc.type}</p>
                        <p className="text-[0.6rem] text-muted-foreground">{doc.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.verified ? (
                        <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0.5 h-auto bg-success/10 text-success border-success/20 gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0.5 h-auto bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Pending
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
