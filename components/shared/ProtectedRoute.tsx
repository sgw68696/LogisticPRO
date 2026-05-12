'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { UserRole, PermissionAction } from '@/data/mockData';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: { module: string; action: PermissionAction };
  fallback?: ReactNode;
}

/**
 * ProtectedRoute component - Guards page access based on user role and permissions
 * Redirects unauthorized users to dashboard
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Check role requirement
    if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
      router.push('/dashboard');
      return;
    }

    // Check permission requirement
    if (
      requiredPermission &&
      !hasPermission(requiredPermission.module, requiredPermission.action)
    ) {
      router.push('/dashboard');
      return;
    }
  }, [user, isLoading, router, requiredRoles, requiredPermission, hasPermission]);

  if (isLoading) {
    return <SkeletonLoader count={5} />;
  }

  // User is not authorized
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="w-96">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not authorized to access this page. Please log in.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has required role
  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="w-96">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Your current role: {user.role}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has required permission
  if (
    requiredPermission &&
    !hasPermission(requiredPermission.module, requiredPermission.action)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="w-96">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to {requiredPermission.action} {requiredPermission.module}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is authorized
  return <>{children}</>;
}

export default ProtectedRoute;
