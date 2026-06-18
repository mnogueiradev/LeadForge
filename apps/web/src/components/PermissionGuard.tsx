import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface Props {
  permissions?: string[];
  roles?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permissions = [], roles = [], children, fallback = null }: Props) {
  const { hasPermission, hasRole } = usePermissions();

  const hasRequiredPermissions = permissions.length === 0 || permissions.every(hasPermission);
  const hasRequiredRoles = roles.length === 0 || roles.every(hasRole);

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
