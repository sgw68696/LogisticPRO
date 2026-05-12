'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { mockOrganizations } from '@/data/mockData';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export default function OrganizationsPage() {
  return (
    <PageWrapper title="Organizations Management" description="Manage organizations across all companies">
      <div className="space-y-6">
        <Button className="gap-2"><Plus className="w-4 h-4" />New Organization</Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockOrganizations.map((org) => (
            <div key={org.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-6">
              <h3 className="font-semibold text-[#e0f2fe] mb-2">{org.name}</h3>
              <p className="text-sm text-[rgba(148,163,184,0.8)] mb-4">{org.type} • {org.city}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
