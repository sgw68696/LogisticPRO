import { type User, type Company, type Organization } from '@/data/mockData';

/**
 * Get the current tenant context for a user
 */
export function getTenantContext(user: User | null) {
  if (!user) {
    return {
      isTenantScope: false,
      companyId: null,
      organizationId: null,
      isSuperAdminScope: false,
    };
  }

  return {
    isTenantScope: !!user.companyId,
    companyId: user.companyId,
    organizationId: user.organizationId,
    isSuperAdminScope: user.role === 'SuperAdmin',
  };
}

/**
 * Filter resources to only those user has access to
 */
export function filterByTenantContext<T extends { companyId?: string | null; organizationId?: string | null }>(
  resources: T[],
  user: User | null
): T[] {
  if (!user) return [];
  if (user.role === 'SuperAdmin') return resources;
  if (!user.companyId) return [];

  return resources.filter(resource => {
    // Must match company
    if (resource.companyId && resource.companyId !== user.companyId) {
      return false;
    }

    // If resource has organization and user has organization, must match
    if (resource.organizationId && user.organizationId && resource.organizationId !== user.organizationId) {
      return false;
    }

    return true;
  });
}

/**
 * Build query filter for API calls based on user context
 */
export function buildTenantFilter(user: User | null): Record<string, string> {
  const filters: Record<string, string> = {};

  if (!user) return filters;
  if (user.role === 'SuperAdmin') return filters;

  if (user.companyId) {
    filters.companyId = user.companyId;
  }

  if (user.organizationId) {
    filters.organizationId = user.organizationId;
  }

  return filters;
}

/**
 * Validate if user can access a company
 */
export function canAccessCompany(user: User | null, company: Company): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  return user.companyId === company.id;
}

/**
 * Validate if user can access an organization
 */
export function canAccessOrganization(user: User | null, organization: Organization): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  if (user.companyId !== organization.companyId) return false;
  if (user.role === 'CompanyAdmin') return true;
  return user.organizationId === organization.id;
}

/**
 * Get company filter parameter for API calls
 */
export function getCompanyFilterParam(user: User | null): string | null {
  if (!user) return null;
  if (user.role === 'SuperAdmin') return null;
  return user.companyId;
}

/**
 * Get organization filter parameter for API calls
 */
export function getOrganizationFilterParam(user: User | null): string | null {
  if (!user) return null;
  if (user.role === 'SuperAdmin' || user.role === 'CompanyAdmin') return null;
  return user.organizationId;
}

/**
 * Validate company scope access
 */
export interface CompanyScopeValidation {
  isValid: boolean;
  hasCompanyContext: boolean;
  errorMessage?: string;
}

export function validateCompanyScope(
  user: User | null,
  companyId: string | null | undefined
): CompanyScopeValidation {
  if (!user) {
    return { isValid: false, hasCompanyContext: false, errorMessage: 'User not authenticated' };
  }

  if (user.role === 'SuperAdmin') {
    return { isValid: true, hasCompanyContext: false };
  }

  if (!user.companyId) {
    return {
      isValid: false,
      hasCompanyContext: false,
      errorMessage: 'User does not belong to any company',
    };
  }

  if (companyId && companyId !== user.companyId) {
    return {
      isValid: false,
      hasCompanyContext: true,
      errorMessage: 'User does not have access to this company',
    };
  }

  return { isValid: true, hasCompanyContext: true };
}

/**
 * Validate organization scope access
 */
export interface OrganizationScopeValidation {
  isValid: boolean;
  hasOrganizationContext: boolean;
  errorMessage?: string;
}

export function validateOrganizationScope(
  user: User | null,
  organizationId: string | null | undefined
): OrganizationScopeValidation {
  if (!user) {
    return { isValid: false, hasOrganizationContext: false, errorMessage: 'User not authenticated' };
  }

  if (user.role === 'SuperAdmin' || user.role === 'CompanyAdmin') {
    return { isValid: true, hasOrganizationContext: false };
  }

  if (!user.organizationId) {
    return {
      isValid: false,
      hasOrganizationContext: false,
      errorMessage: 'User does not belong to any organization',
    };
  }

  if (organizationId && organizationId !== user.organizationId) {
    return {
      isValid: false,
      hasOrganizationContext: true,
      errorMessage: 'User does not have access to this organization',
    };
  }

  return { isValid: true, hasOrganizationContext: true };
}

/**
 * Get breadcrumb items based on tenant context
 */
export interface TenantBreadcrumb {
  label: string;
  href: string;
}

export function getTenantBreadcrumbs(
  user: User | null,
  company?: Company | null,
  organization?: Organization | null
): TenantBreadcrumb[] {
  const breadcrumbs: TenantBreadcrumb[] = [];

  if (user?.role === 'SuperAdmin') {
    breadcrumbs.push({ label: 'Platform', href: '/dashboard' });
    if (company) {
      breadcrumbs.push({ label: company.name, href: `/companies/${company.id}` });
    }
  } else if (company) {
    breadcrumbs.push({ label: company.name, href: '/dashboard' });
  }

  if (organization) {
    breadcrumbs.push({ label: organization.name, href: `/organizations/${organization.id}` });
  }

  return breadcrumbs;
}
