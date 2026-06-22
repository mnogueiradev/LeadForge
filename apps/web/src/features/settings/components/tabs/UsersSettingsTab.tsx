import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/features/users/api/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldAlert, BadgeDollarSign, Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export function UsersSettingsTab() {
  const navigate = useNavigate();
  const { data: usersData, isLoading } = useUsers();
  const { hasPermission } = usePermissions();
  
  const canManageRoles = hasPermission('roles.manage');

  const users = usersData?.data || [];
  
  const totalUsers = users.length;
  // This is an estimation based on standard role names, adjust according to actual role property structure if different
  const totalAdmins = users.filter((u: any) => u.userRoles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('admin') || ur.role?.name?.toLowerCase().includes('owner'))).length;
  const totalSellers = users.filter((u: any) => u.userRoles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('vendedor') || ur.role?.name?.toLowerCase().includes('sales'))).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Usuários e Permissões</h3>
        <p className="text-sm text-muted-foreground">
          Visão geral da equipe e perfis de acesso no sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Membros ativos na plataforma
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administradores
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAdmins}</div>
              <p className="text-xs text-muted-foreground">
                Com acesso irrestrito
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendedores
              </CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSellers}</div>
              <p className="text-xs text-muted-foreground">
                Focados na operação comercial
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        {/* We assume /rbac or /users is the route for managing users */}
        <Button onClick={() => navigate('/rbac')} disabled={!canManageRoles}>
          Gerenciar Usuários e Perfis
        </Button>
      </div>
    </div>
  );
}
