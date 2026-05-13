'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import {
  FileText, CheckCircle, AlertCircle, Search,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: string) => {
  const statusColorMap: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    'Cleared': 'bg-green-500/10 text-green-700 border-green-200',
    'Hold': 'bg-red-500/10 text-red-700 border-red-200',
    'In Progress': 'bg-blue-500/10 text-blue-700 border-blue-200',
  };
  return statusColorMap[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

// Static mock data for pending clearance
const pendingClearanceData = [
  { id: 'LOG-2025-10001', origin: 'Shanghai', destination: 'Mumbai', declaredValue: '$45,000', status: 'Pending' },
  { id: 'LOG-2025-10002', origin: 'Tokyo', destination: 'Delhi', declaredValue: '$32,500', status: 'In Progress' },
  { id: 'LOG-2025-10003', origin: 'Singapore', destination: 'Bangalore', declaredValue: '$67,800', status: 'Pending' },
  { id: 'LOG-2025-10004', origin: 'Hong Kong', destination: 'Chennai', declaredValue: '$28,900', status: 'In Progress' },
  { id: 'LOG-2025-10005', origin: 'Rotterdam', destination: 'Jawaharlal Nehru', declaredValue: '$91,200', status: 'Pending' },
];

// Static mock data for recent holds
const recentHoldsData = [
  { id: 'LOG-2025-09998', reason: 'Documentation Missing', raisedDate: '2025-01-15', priority: 'High' },
  { id: 'LOG-2025-09999', reason: 'Quantity Mismatch', raisedDate: '2025-01-14', priority: 'Medium' },
  { id: 'LOG-2025-10000', reason: 'DG Classification Review', raisedDate: '2025-01-13', priority: 'High' },
  { id: 'LOG-2025-10006', reason: 'COO Verification Pending', raisedDate: '2025-01-12', priority: 'Low' },
];

export default function CustomsDashboard() {
  return (
    <PageWrapper title="Customs Dashboard" description="Monitor customs declarations, clearances, and compliance">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Declarations Pending"
            value="12"
            icon={FileText}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Cleared Today"
            value="8"
            icon={CheckCircle}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <KPICard
            title="Holds / Queries"
            value="4"
            icon={AlertCircle}
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
          <KPICard
            title="HS Code Lookups"
            value="156"
            icon={Search}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Clearance Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Pending Clearance</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-slate-700">Shipment ID</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Origin</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Destination</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Declared Value</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingClearanceData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm font-medium text-slate-900">{row.id}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.origin}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.destination}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.declaredValue}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(row.status)}`} variant="outline">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Recent Holds List */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Recent Holds</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {recentHoldsData.map((row) => (
                <div key={row.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{row.id}</p>
                      <p className="text-sm text-slate-600 mt-1">{row.reason}</p>
                      <p className="text-xs text-slate-500 mt-1">{row.raisedDate}</p>
                    </div>
                    <Badge 
                      className={`ml-2 text-xs ${
                        row.priority === 'High' 
                          ? 'bg-red-500/10 text-red-700 border-red-200'
                          : row.priority === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                          : 'bg-green-500/10 text-green-700 border-green-200'
                      }`}
                      variant="outline"
                    >
                      {row.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
