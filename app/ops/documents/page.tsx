'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockCargo, mockShipments } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';

export default function DocumentsPage() {
  const documents = useMemo(() => {
    const docs: Array<{
      id: string;
      type: string;
      shipmentId: string;
      cargoId?: string;
      description: string;
      status: string;
      createdDate: string;
    }> = [];

    // Add shipment documents
    mockShipments.slice(0, 10).forEach((shipment) => {
      docs.push({
        id: `doc-${shipment.id}-pod`,
        type: 'Proof of Delivery',
        shipmentId: shipment.id,
        description: `POD for ${shipment.trackingNumber}`,
        status: shipment.status === 'Delivered' ? 'Available' : 'Pending',
        createdDate: shipment.updatedAt,
      });
      docs.push({
        id: `doc-${shipment.id}-waybill`,
        type: 'Waybill',
        shipmentId: shipment.id,
        description: `Waybill for ${shipment.trackingNumber}`,
        status: 'Available',
        createdDate: shipment.createdAt,
      });
    });

    // Add cargo documents
    mockCargo.slice(0, 5).forEach((cargo) => {
      docs.push({
        id: `doc-${cargo.id}-packing`,
        type: 'Packing List',
        cargoId: cargo.id,
        shipmentId: '',
        description: `Packing list for ${cargo.cargoNumber}`,
        status: 'Available',
        createdDate: cargo.createdAt,
      });
    });

    return docs.slice(0, 15);
  }, []);

  return (
    <PageWrapper title="Documents" description="View and download shipment and cargo documents">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(14,165,233,0.1)] hover:bg-transparent">
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Type</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Reference ID</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Description</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Created Date</TableHead>
                <TableHead className="text-[#94a3b8] text-xs font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <TableCell className="text-[#e0f2fe] text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      {doc.type}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#e0f2fe] text-sm font-mono text-xs">
                    {doc.shipmentId || doc.cargoId}
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">{doc.description}</TableCell>
                  <TableCell>
                    <Badge className={
                      doc.status === 'Available'
                        ? 'bg-green-500/10 text-green-700 border-green-200'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                    } style={{ border: '1px solid' }}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#94a3b8] text-sm">
                    {new Date(doc.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-xs">
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
