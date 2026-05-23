'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { buildTenantFilter, filterByTenantContext, type CompanyOperationalType } from '@/utils/tenancy';
import type { UserRole } from '@/data/mock-db';

export interface CompanyContext {
  companyId: string | null;
  organizationId: string | null;
  companyType: CompanyOperationalType;
  userRole: UserRole;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isOrganizationAdmin: boolean;
  tenantFilter: Record<string, string>;
  effectiveCompanyId: string;
  hasCompanyContext: boolean;
}

export function useCompany(): CompanyContext {
  const { user, isSuperAdmin, isCompanyAdmin, isOrganizationAdmin } = useAuth();

  return useMemo(() => {
    const companyId = user?.companyId || null;
    const organizationId = user?.organizationId || null;
    const userRole = (user?.role || 'Staff') as UserRole;
    const companyType = ((user as any)?.companyType || 'standard') as CompanyOperationalType;

    const tenantFilter = buildTenantFilter(user);
    const effectiveCompanyId = companyId || 'cmp-001';
    const hasCompanyContext = !!companyId;

    return {
      companyId,
      organizationId,
      companyType,
      userRole,
      isSuperAdmin,
      isCompanyAdmin,
      isOrganizationAdmin,
      tenantFilter,
      effectiveCompanyId,
      hasCompanyContext,
    };
  }, [user, isSuperAdmin, isCompanyAdmin, isOrganizationAdmin]);
}

export function useFilterByCompany<T extends { companyId?: string | null; organizationId?: string | null }>(
  items: T[]
): T[] {
  const { user } = useAuth();
  return useMemo(() => {
    return filterByTenantContext(items, user);
  }, [items, user]);
}

export default useCompany;
