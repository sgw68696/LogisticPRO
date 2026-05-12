'use client';

import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';
import { roleMenuConfig, mockUsers } from '@/data/mockData';
import { getRoleDisplayName, getRoleColor } from '@/utils/permissions';
import type { UserRole } from '@/data/mockData';

export default function AccessControlPage() {
  const { user, isSuperAdmin, isCompanyAdmin, canManageAgents, allowedMenuItems } = useAuth();

  const allRoles: UserRole[] = ['SuperAdmin', 'CompanyAdmin', 'Manager', 'Dispatcher', 'Agent', 'Staff', 'Operator', 'Admin'];
  const allMenuItems = Array.from(
    new Set(
      Object.values(roleMenuConfig).flatMap(items => items)
    )
  );

  const canAccessItem = (role: UserRole, item: string): boolean => {
    const roleItems = roleMenuConfig[role];
    return roleItems ? roleItems.includes(item) : false;
  };

  const getUsersWithRole = (role: UserRole) => {
    return mockUsers.filter(u => u.role === role);
  };

  const getRoleAccessCount = (role: UserRole): number => {
    return roleMenuConfig[role]?.length || 0;
  };

  return (
    <PageWrapper
      title="Access Control Verification"
      subtitle="Dashboard access control matrix for all user roles"
    >
      <div className="space-y-6">
        {/* Current User Info */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Access Profile</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Username:</span> {user?.username || 'Not logged in'}
                </p>
                <p>
                  <span className="font-medium">Role:</span>
                  <Badge className={`ml-2 ${getRoleColor(user?.role as UserRole)}`}>
                    {getRoleDisplayName(user?.role as UserRole)}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">Company:</span> {user?.companyId || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Organization:</span> {user?.organizationId || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Accessible Menu Items:</span> {allowedMenuItems.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium mb-2">Permissions:</p>
              <div className="space-y-1 text-sm">
                <p>
                  SuperAdmin:{' '}
                  {isSuperAdmin ? (
                    <CheckCircle2 className="inline text-green-600 w-4 h-4" />
                  ) : (
                    <XCircle className="inline text-gray-400 w-4 h-4" />
                  )}
                </p>
                <p>
                  CompanyAdmin:{' '}
                  {isCompanyAdmin ? (
                    <CheckCircle2 className="inline text-green-600 w-4 h-4" />
                  ) : (
                    <XCircle className="inline text-gray-400 w-4 h-4" />
                  )}
                </p>
                <p>
                  CanManageAgents:{' '}
                  {canManageAgents ? (
                    <CheckCircle2 className="inline text-green-600 w-4 h-4" />
                  ) : (
                    <XCircle className="inline text-gray-400 w-4 h-4" />
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Role Access Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Role Access Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allRoles.map(role => {
              const count = getRoleAccessCount(role);
              const usersCount = getUsersWithRole(role).length;
              return (
                <div
                  key={role}
                  className="p-3 border rounded-lg text-sm"
                >
                  <p className="font-semibold text-xs text-gray-600 mb-2">{getRoleDisplayName(role)}</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">menu items</p>
                  <p className="text-xs text-gray-400 mt-1">{usersCount} user{usersCount !== 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Access Matrix */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Access Control Matrix</h3>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="w-32">Menu Item</TableHead>
                  {allRoles.map(role => (
                    <TableHead key={role} className="text-center text-xs">
                      {getRoleDisplayName(role).split(' ')[0]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMenuItems.map(item => (
                  <TableRow key={item} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium text-sm capitalize">
                      {item.replace(/_/g, ' ')}
                    </TableCell>
                    {allRoles.map(role => {
                      const hasAccess = canAccessItem(role, item);
                      return (
                        <TableCell key={`${item}-${role}`} className="text-center">
                          {hasAccess ? (
                            <CheckCircle2 className="inline w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="inline w-4 h-4 text-gray-300" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Test Users */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <Shield className="inline w-5 h-5 mr-2" />
            Test Users for Access Control Verification
          </h3>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Menu Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map(testUser => (
                  <TableRow key={testUser.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-mono text-sm">{testUser.username}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{testUser.password}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(testUser.role as UserRole)}>
                        {getRoleDisplayName(testUser.role as UserRole)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{testUser.companyId || '-'}</TableCell>
                    <TableCell className="text-sm">{testUser.organizationId || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {roleMenuConfig[testUser.role as UserRole]?.length || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Your Accessible Items */}
        {user && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Accessible Menu Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allowedMenuItems.map(item => (
                <div
                  key={item}
                  className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-sm font-medium text-green-800 dark:text-green-200 capitalize"
                >
                  {item.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            How to Use This Page
          </h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside">
            <li>Your current access level is displayed above</li>
            <li>The Access Control Matrix shows which roles can access which menu items</li>
            <li>Test Users section shows all available credentials for testing</li>
            <li>Log out and log in with different test users to verify access control</li>
            <li>Try accessing restricted pages by changing the URL directly</li>
            <li>Verify that unauthorized access redirects to the dashboard</li>
          </ol>
        </Card>
      </div>
    </PageWrapper>
  );
}
