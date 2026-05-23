import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { companyAdminMenu } from '@/data/menu/company-admin-menu';
import { COMPANY_TYPE_MENU_MAP, ENABLED_MODULES_BY_TYPE } from '@/data/company-type-menus';
import type { MenuItem } from '@/components/layout/Sidebar/AppSidebar.types';
import type { CompanyOperationalType } from '@/types/company-operational-types';
import { Layers3 } from 'lucide-react';

export interface FeatureFlags {
  enabledModules: string[];
  companyType: CompanyOperationalType;
}

export function useFeatureFlags(): FeatureFlags {
  const { user } = useAuth();
  return useMemo(() => {
    const companyType: CompanyOperationalType = (user as any)?.companyType ?? 'standard';
    return {
      enabledModules: (user as any)?.assignedModules ?? ENABLED_MODULES_BY_TYPE[companyType] ?? [],
      companyType,
    };
  }, [user]);
}

function createOperationsGroup(children: MenuItem[]): MenuItem | null {
  if (children.length === 0) return null;

  return {
    id: 'operations',
    label: 'Operations',
    icon: Layers3,
    description: 'Operational modules for enhanced company types',
    children,
  };
}

function mergeMenuItemsWithOperationsGroup(
  base: MenuItem[],
  extra: MenuItem[]
): MenuItem[] {
  if (extra.length === 0) return base;

  const existingIds = new Set(base.map((m) => m.id));
  const filteredExtra = extra.filter((item) => !existingIds.has(item.id));

  if (filteredExtra.length === 0) return base;

  const operationsGroup = createOperationsGroup(filteredExtra);
  if (!operationsGroup) return base;

  const result = [...base];

  const usersSettingsIndex = result.findIndex((m) => m.id === 'users-settings');
  if (usersSettingsIndex !== -1) {
    result.splice(usersSettingsIndex, 0, operationsGroup);
  } else {
    result.push(operationsGroup);
  }

  return result;
}

export function useAccessibleMenus(): MenuItem[] {
  const { user } = useAuth();
  const flags = useFeatureFlags();

  return useMemo(() => {
    const baseMenu = companyAdminMenu;
    const companyType = flags.companyType;

    const extraMenuItems = COMPANY_TYPE_MENU_MAP[companyType] ?? [];
    const merged = mergeMenuItemsWithOperationsGroup(baseMenu, extraMenuItems);

    const assignedMenus = (user as any)?.assignedMenus as string[] | undefined;
    if (assignedMenus && assignedMenus.length > 0) {
      const allowedIds = new Set(assignedMenus);
      return merged.filter((item) => {
        if (allowedIds.has(item.id)) return true;
        if (item.children?.some((c) => allowedIds.has(c.id))) return true;
        return false;
      });
    }

    return merged;
  }, [user, flags.companyType, flags.enabledModules]);
}

export function getAccessibleMenus(
  baseMenu: MenuItem[],
  companyType: CompanyOperationalType,
  enabledModules: string[],
  assignedMenus?: string[]
): MenuItem[] {
  const extraMenuItems = COMPANY_TYPE_MENU_MAP[companyType] ?? [];
  let merged = mergeMenuItems(baseMenu, extraMenuItems);

  if (assignedMenus && assignedMenus.length > 0) {
    const allowedIds = new Set(assignedMenus);
    merged = merged.filter((item) => {
      if (allowedIds.has(item.id)) return true;
      if (item.children?.some((c) => allowedIds.has(c.id))) return true;
      return false;
    });
  } else if (enabledModules.length > 0) {
    merged = merged.filter(
      (item) => enabledModules.includes(item.id) || item.children?.some((c) => enabledModules.includes(c.id))
    );
  }
  return merged;
}

export const ALL_COMPANY_TYPE_MENU_IDS = COMPANY_TYPE_MENU_MAP['custom_agent']?.map((m) => m.id) ?? [];
