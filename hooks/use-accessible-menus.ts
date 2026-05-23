import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { companyAdminMenu } from '@/data/menu/company-admin-menu';
import { COMPANY_TYPE_MENU_MAP, ENABLED_MODULES_BY_TYPE } from '@/data/company-type-menus';
import type { MenuItem } from '@/components/layout/Sidebar/AppSidebar.types';
import type { CompanyOperationalType } from '@/types/company-operational-types';

export interface FeatureFlags {
  enabledModules: string[];
  companyType: CompanyOperationalType;
}

export function useFeatureFlags(): FeatureFlags {
  const { user } = useAuth();
  return useMemo(() => {
    const companyType: CompanyOperationalType = (user as any)?.companyType ?? 'standard';
    return {
      enabledModules: ENABLED_MODULES_BY_TYPE[companyType] ?? [],
      companyType,
    };
  }, [user]);
}

function mergeMenuItems(base: MenuItem[], extra: MenuItem[]): MenuItem[] {
  const existingIds = new Set(base.map((m) => m.id));
  const merged = [...base];
  for (const item of extra) {
    if (!existingIds.has(item.id)) {
      merged.push(item);
      existingIds.add(item.id);
    }
  }
  return merged;
}

export function useAccessibleMenus(): MenuItem[] {
  const { user } = useAuth();
  const flags = useFeatureFlags();

  return useMemo(() => {
    const baseMenu = companyAdminMenu;
    const companyType = flags.companyType;

    const extraMenuItems = COMPANY_TYPE_MENU_MAP[companyType] ?? [];
    const merged = mergeMenuItems(baseMenu, extraMenuItems);
    return merged;
  }, [user, flags.companyType]);
}

export function getAccessibleMenus(
  baseMenu: MenuItem[],
  companyType: CompanyOperationalType,
  enabledModules: string[]
): MenuItem[] {
  const extraMenuItems = COMPANY_TYPE_MENU_MAP[companyType] ?? [];
  let merged = mergeMenuItems(baseMenu, extraMenuItems);
  if (enabledModules.length > 0) {
    merged = merged.filter(
      (item) => enabledModules.includes(item.id) || item.children?.some((c) => enabledModules.includes(c.id))
    );
  }
  return merged;
}
