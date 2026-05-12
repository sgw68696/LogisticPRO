'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockCompanies } from '@/data/mockData';
import {
  Search, Plus, Eye, Edit, Trash2, Badge,
} from 'lucide-react';

export default function CompaniesPage() {
  return (
    <PageWrapper title="Companies Management" description="Manage all companies on the platform">
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[rgba(148,163,184,0.5)]" />
            <Input
              placeholder="Search companies..."
              className="pl-10 bg-[rgba(255,255,255,0.05)] border-[rgba(14,165,233,0.2)] text-[#e0f2fe]"
            />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Company
          </Button>
        </div>

        {/* Companies Table */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(14,165,233,0.1)] bg-[rgba(14,165,233,0.05)]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Company Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Contact</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#7dd3fc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)] transition">
                    <td className="px-6 py-4 text-sm text-[#e0f2fe] font-medium">{company.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={company.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {company.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgba(148,163,184,0.8)]">{company.businessType}</td>
                    <td className="px-6 py-4 text-sm text-[rgba(148,163,184,0.8)]">{company.contactPerson}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
