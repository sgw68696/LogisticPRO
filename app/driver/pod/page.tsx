'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Camera, Upload, FileCheck, FileText,
  CheckCircle2, XCircle, Image, Signature,
  MapPin, Clock, ArrowRight, X,
  Download, Eye, Trash2,
} from 'lucide-react';

interface PodRecord {
  id: string;
  trackingNumber: string;
  customerName: string;
  deliveryDate: string;
  status: 'Pending' | 'Submitted' | 'Verified';
  photos: number;
  hasSignature: boolean;
}

const MOCK_PODS: PodRecord[] = [
  { id: 'pod-001', trackingNumber: 'LTP-2025-0042', customerName: 'Rajesh Electronics', deliveryDate: '2026-05-21', status: 'Verified', photos: 2, hasSignature: true },
  { id: 'pod-002', trackingNumber: 'LTP-2025-0038', customerName: 'Mumbai Traders', deliveryDate: '2026-05-20', status: 'Submitted', photos: 1, hasSignature: true },
  { id: 'pod-003', trackingNumber: 'LTP-2025-0035', customerName: 'Patel Distributors', deliveryDate: '2026-05-19', status: 'Verified', photos: 3, hasSignature: false },
  { id: 'pod-004', trackingNumber: 'LTP-2025-0029', customerName: 'Gupta Wholesale', deliveryDate: '2026-05-18', status: 'Pending', photos: 0, hasSignature: false },
  { id: 'pod-005', trackingNumber: 'LTP-2025-0025', customerName: 'Singh Logistics', deliveryDate: '2026-05-17', status: 'Submitted', photos: 2, hasSignature: true },
];

export default function PODPage() {
  const [pods] = useState(MOCK_PODS);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <PageWrapper
      title="Proof of Delivery"
      description="Upload delivery photos, capture signatures, and submit POD documents"
      actions={
        <Button size="sm" className="gap-1.5 text-xs h-8 text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          <Camera className="w-3.5 h-3.5" /> New POD
        </Button>
      }
    >
      {/* Upload Card */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[0.82rem] font-semibold text-foreground">Upload Delivery Photo</p>
            <p className="text-[0.7rem] text-muted-foreground mt-1">Drag & drop or click to browse</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge variant="outline" className="text-[0.6rem] px-2 py-0.5 h-auto bg-muted/40 text-muted-foreground gap-1">
                <Image className="w-3 h-3" /> JPG/PNG
              </Badge>
              <Badge variant="outline" className="text-[0.6rem] px-2 py-0.5 h-auto bg-muted/40 text-muted-foreground gap-1">
                Max 10MB
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent POD Records */}
      <Card className="bg-card border border-border/60 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-[0.82rem] font-bold font-display">Recent POD Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {pods.map(pod => (
              <div key={pod.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/10 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${pod.status === 'Verified' ? 'bg-success/10 text-success border-success/20' : pod.status === 'Submitted' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {pod.status === 'Verified' ? <CheckCircle2 className="w-4 h-4" /> : pod.status === 'Submitted' ? <FileCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.75rem] font-medium text-foreground font-mono">{pod.trackingNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.6rem] font-bold border ${pod.status === 'Verified' ? 'bg-success/10 text-success border-success/20' : pod.status === 'Submitted' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {pod.status}
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    {pod.customerName} · {pod.deliveryDate} · {pod.photos} photo{pod.photos !== 1 ? 's' : ''}
                    {pod.hasSignature && ' · Signed'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {pod.photos > 0 && (
                    <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                  )}
                  {pod.status !== 'Verified' && (
                    <>
                      <button className="p-1.5 rounded text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"><Camera className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Signature className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
