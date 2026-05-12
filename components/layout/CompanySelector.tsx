"use client";

import React, { useState } from 'react';
import { ChevronDown, Building2, Briefcase } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { mockCompanies, mockOrganizations } from '@/data/mockData';
import { cn } from '@/lib/utils';

/**
 * CompanySelector - Allows users to switch between companies and organizations
 * Only visible for CompanyAdmin and Manager roles
 */
export function CompanySelector() {
  const { user, isCompanyAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(user?.companyId || '');
  const [selectedOrgId, setSelectedOrgId] = useState(user?.organizationId || '');

  // Filter companies visible to the user
  const visibleCompanies = isCompanyAdmin
    ? mockCompanies.filter(c => c.id === user?.companyId)
    : mockCompanies;

  // Filter organizations for selected company
  const visibleOrganizations = mockOrganizations.filter(
    o => o.companyId === selectedCompanyId
  );

  const currentCompany = mockCompanies.find(c => c.id === selectedCompanyId);
  const currentOrg = mockOrganizations.find(o => o.id === selectedOrgId);

  if (!isCompanyAdmin && !user?.companyId) {
    return null; // SuperAdmin doesn't need company selector
  }

  return (
    <div className="flex items-center gap-2">
      {/* Company Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9"
          >
            <Building2 className="w-4 h-4" />
            <span className="truncate text-sm max-w-[150px]">
              {currentCompany?.name || 'Select Company'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs">Companies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {visibleCompanies.map(company => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                selectedCompanyId === company.id && 'bg-accent'
              )}
            >
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">{company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {company.plan}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Organization Selector */}
      {visibleOrganizations.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-9"
            >
              <Briefcase className="w-4 h-4" />
              <span className="truncate text-sm max-w-[150px]">
                {currentOrg?.name || 'All Organizations'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSelectedOrgId('')}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                !selectedOrgId && 'bg-accent'
              )}
            >
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">All Organizations</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {visibleOrganizations.map(org => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  selectedOrgId === org.id && 'bg-accent'
                )}
              >
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.type}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
