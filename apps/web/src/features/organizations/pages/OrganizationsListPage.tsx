import * as React from 'react';
import { Plus, Search, Building2, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

import { useOrganizations, useArchiveOrganization, useDeleteOrganization, Organization } from '../api/use-organizations';
import { OrganizationFormModal } from '../components/organization-form-modal';
import { useDebounce } from '@/hooks/use-debounce';

export function OrganizationsListPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedOrganization, setSelectedOrganization] = React.useState<Organization | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error } = useOrganizations({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const archiveMutation = useArchiveOrganization();
  const deleteMutation = useDeleteOrganization();

  const handleCreate = () => {
    setSelectedOrganization(null);
    setIsModalOpen(true);
  };

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsModalOpen(true);
  };

  const handleArchive = async (organization: Organization) => {
    if (confirm(`Deseja realmente arquivar a empresa "${organization.name}"? Esta ação ocultará a empresa das listagens ativas.`)) {
      try {
        await archiveMutation.mutateAsync(organization.id);
        toast.success('Empresa arquivada com sucesso!');
      } catch (err) {
        toast.error('Erro ao arquivar a empresa.');
      }
    }
  };

  const handleDelete = async (organization: Organization) => {
    if (confirm(`Deseja realmente excluir permanentemente a empresa "${organization.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteMutation.mutateAsync(organization.id);
        toast.success('Empresa excluída com sucesso!');
      } catch (err) {
        toast.error('Erro ao excluir a empresa. Pode haver dados vinculados a ela.');
      }
    }
  };

  const columns = [
    { 
      accessorKey: 'name', 
      header: 'Nome da Empresa',
      cell: ({ row }: any) => {
        const org = row.original;
        return (
          <div className="flex items-center gap-2 font-medium cursor-pointer" onClick={() => handleEdit(org)}>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {org.name}
          </div>
        );
      }
    },
    { accessorKey: 'industry', header: 'Segmento', cell: ({ row }: any) => row.getValue('industry') || '-' },
    { 
      accessorKey: 'website', 
      header: 'Website',
      cell: ({ row }: any) => {
        const website = row.getValue('website');
        if (!website) return '-';
        return (
          <a href={website} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">
            {website.replace(/^https?:\/\//, '')}
          </a>
        );
      }
    },
    { 
      accessorKey: 'owner', 
      header: 'Responsável',
      cell: ({ row }: any) => {
        const owner = row.original.owner;
        return owner ? `${owner.firstName} ${owner.lastName}` : '-';
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status');
        const getVariant = (s: string) => {
          if (s === 'CUSTOMER' || s === 'ACTIVE') return 'default';
          if (s === 'PROSPECT' || s === 'LEAD') return 'secondary';
          if (s === 'ARCHIVED') return 'outline';
          return 'destructive';
        };
        
        const labels: Record<string, string> = {
          PROSPECT: 'Prospecção',
          CUSTOMER: 'Cliente',
          PARTNER: 'Parceiro',
          SUPPLIER: 'Fornecedor',
          ACTIVE: 'Ativo',
          INACTIVE: 'Inativo',
          ARCHIVED: 'Arquivado',
          LEAD: 'Lead'
        };
        
        return <Badge variant={getVariant(status) as any}>{labels[status] || status}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={() => handleArchive(row.original)}
              disabled={row.original.status === 'ARCHIVED'}
            >
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">Falha ao carregar empresas. Verifique sua conexão ou tente novamente mais tarde.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Recarregar página</Button>
      </div>
    );
  }

  const organizations = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as organizações e clientes do seu CRM.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar empresas (nome, CNPJ)..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filtros</Button>
        <Button variant="outline">Exportar</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : organizations.length === 0 ? (
          <EmptyState 
            icon={<Building2 className="h-10 w-10 text-muted-foreground" />}
            title="Nenhuma empresa encontrada"
            description={searchTerm ? "Não encontramos empresas com os termos buscados." : "Você ainda não possui empresas cadastradas."}
            action={
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={organizations} />
            {meta && meta.totalPages > 1 && (
              <div className="p-4 border-t flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <OrganizationFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={selectedOrganization}
      />
    </div>
  );
}
