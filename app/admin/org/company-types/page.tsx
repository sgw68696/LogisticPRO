'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const companyTypes = [
  { id: 1, name: 'Freight Forwarder', description: 'Company specializing in freight forwarding' },
  { id: 2, name: 'Courier', description: 'Company providing courier services' },
  { id: 3, name: 'Logistics Provider', description: 'Full logistics service provider' },
  { id: 4, name: 'Express Delivery', description: 'Express delivery services' },
  { id: 5, name: 'Warehouse Operator', description: 'Warehouse and storage provider' },
];

export default function CompanyTypesPage() {
  return (
    <PageWrapper title="Company Types" description="Define and manage company categories">
      <div className="space-y-6">
        <Button className="gap-2"><Plus className="w-4 h-4" />New Company Type</Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyTypes.map((type) => (
            <div key={type.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-6">
              <h3 className="font-semibold text-[#e0f2fe] mb-2">{type.name}</h3>
              <p className="text-sm text-[rgba(148,163,184,0.8)]">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
