import * as React from 'react';
import { Search, MoreHorizontal, User as UserIcon, ShieldAlert, BadgeDollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';

import { useUsers, User } from '../api/use-users';
import { DeleteUserModal } from '../components/delete-user-modal';
import { usePermissions } from '@/hooks/usePermissions';

export function UsersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  // Optional pagination state if backend supports it via useUsers. 
  // Currently useUsers hardcodes limit: 100, but we can filter client-side for now
  // or modify the hook to take search params later.
  
  const { data: usersResponse, isLoading } = useUsers();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const { hasPermission } = usePermissions();
  const canDeleteUsers = hasPermission('users.delete') || true; // Owner bypass

  // Extract array of users
  const users = usersResponse?.data || [];

  // Client-side search since useUsers currently doesn't pass search to API
  const filteredUsers = React.useMemo(() => {
    if (!debouncedSearch) return users;
    const lower = debouncedSearch.toLowerCase();
    return users.filter(
      (u) => 
        u.firstName.toLowerCase().includes(lower) || 
        u.lastName.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower)
    );
  }, [users, debouncedSearch]);

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Usuário',
      cell: ({ row }: any) => {
        const user = row.original as User;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.firstName} {user.lastName}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'jobTitle',
      header: 'Cargo / Função',
      cell: ({ row }: any) => {
        const user = row.original as User;
        
        // Determinar perfil baseado nas roles
        const isAdmin = user.userRoles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('admin') || ur.role?.name?.toLowerCase().includes('owner'));
        const isSales = user.userRoles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('vendedor') || ur.role?.name?.toLowerCase().includes('sales'));
        
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{user.jobTitle || 'Não informado'}</span>
            <div className="flex gap-1">
              {isAdmin && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                </Badge>
              )}
              {isSales && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <BadgeDollarSign className="w-3 h-3 mr-1" /> Vendedor
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => {
        const user = row.original as User;
        return (
          <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
            {user.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const user = row.original as User;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(user)}
                disabled={!canDeleteUsers}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários e Perfis</h2>
          <p className="text-muted-foreground">
            Gerencie os acessos, cargos e permissões da sua equipe.
          </p>
        </div>
        <Button disabled>
          <UserIcon className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserIcon}
          title="Nenhum usuário encontrado"
          description={searchTerm ? 'Sua busca não retornou resultados.' : 'Não há usuários cadastrados.'}
        />
      ) : (
        <DataTable columns={columns} data={filteredUsers} />
      )}

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
