'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Plus, Trash2, Save } from 'lucide-react';
import type { UserRole, PermissionAction } from '@/data/mockData';
import { getRoleColor, getRoleDisplayName } from '@/utils/permissions';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  import?: boolean;
}

interface PermissionMatrixState {
  [module: string]: Permission;
}

interface PermissionMatrixProps {
  role: UserRole;
  permissions: PermissionMatrixState;
  modules: string[];
  onPermissionChange?: (module: string, action: PermissionAction, value: boolean) => void;
  readOnly?: boolean;
}

/**
 * PermissionMatrix - Visual permission editor component
 * Displays and allows editing of role-based permissions in a matrix format
 */
export function PermissionMatrix({
  role,
  permissions,
  modules,
  onPermissionChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [changedModules, setChangedModules] = useState<Set<string>>(new Set());

  const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

  const handlePermissionToggle = (
    module: string,
    action: PermissionAction,
    value: boolean
  ) => {
    if (readOnly || !onPermissionChange) return;

    onPermissionChange(module, action, value);
    setChangedModules(prev => new Set(prev).add(module));
  };

  const getActionColor = (action: PermissionAction): string => {
    const colors: Record<PermissionAction, string> = {
      view: 'bg-blue-50 dark:bg-blue-950',
      create: 'bg-green-50 dark:bg-green-950',
      edit: 'bg-yellow-50 dark:bg-yellow-950',
      delete: 'bg-red-50 dark:bg-red-950',
    };
    return colors[action] || 'bg-gray-50';
  };

  const getActionLabel = (action: PermissionAction): string => {
    const labels: Record<PermissionAction, string> = {
      view: 'View',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
    };
    return labels[action];
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Permission Matrix</h3>
          <p className="text-sm text-gray-500">
            Role: <Badge className={getRoleColor(role)}>{getRoleDisplayName(role)}</Badge>
          </p>
        </div>
        {!readOnly && changedModules.size > 0 && (
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes ({changedModules.size})
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead className="w-48">Module</TableHead>
              {actions.map(action => (
                <TableHead
                  key={action}
                  className={`text-center py-3 ${getActionColor(action)}`}
                >
                  {getActionLabel(action)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map(module => (
              <TableRow key={module} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium capitalize">
                  {module.replace(/_/g, ' ')}
                </TableCell>
                {actions.map(action => {
                  const hasPermission = permissions[module]?.[action] ?? false;
                  const isChanged = changedModules.has(module);

                  return (
                    <TableCell
                      key={`${module}-${action}`}
                      className={`text-center py-3 ${
                        isChanged ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                    >
                      <Checkbox
                        checked={hasPermission}
                        disabled={readOnly}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(
                            module,
                            action,
                            checked as boolean
                          )
                        }
                        className="mx-auto"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {readOnly && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm text-blue-800 dark:text-blue-200">
          <Eye className="w-4 h-4 inline mr-2" />
          This permission matrix is read-only
        </div>
      )}
    </div>
  );
}

export default PermissionMatrix;
