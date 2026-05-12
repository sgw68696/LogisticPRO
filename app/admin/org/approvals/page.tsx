'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';

const pendingApprovals = [
  { id: 1, company: 'Global Express Cargo', type: 'Company Registration', date: '2025-01-14', status: 'Pending' },
];

export default function ApprovalsPage() {
  return (
    <PageWrapper title="Approvals" description="Review and approve pending requests">
      <div className="space-y-6">
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(14,165,233,0.1)] bg-[rgba(14,165,233,0.05)]">
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Request Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[#7dd3fc]">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item) => (
                <tr key={item.id} className="border-b border-[rgba(14,165,233,0.05)]">
                  <td className="px-6 py-4 text-sm text-[#e0f2fe] font-medium">{item.company}</td>
                  <td className="px-6 py-4 text-sm text-[rgba(148,163,184,0.8)]">{item.type}</td>
                  <td className="px-6 py-4 text-sm text-[rgba(148,163,184,0.8)]">{item.date}</td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" className="gap-1"><Check className="w-4 h-4" />Approve</Button>
                    <Button size="sm" variant="ghost"><X className="w-4 h-4 text-red-400" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
