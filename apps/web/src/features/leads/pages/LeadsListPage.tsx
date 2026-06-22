import * as React from 'react';
import { Plus, Search, Target, MoreHorizontal, ArrowUpRight, Flame, Pencil, Archive, Trash2 } from 'lucide-react';
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

import { useLeads, useDeleteLead, Lead, useArchiveLead } from '../api/use-leads';
import { LeadFormModal } from '../components/lead-form-modal';
import { useDebounce } from '@/hooks/use-debounce';

export function LeadsListPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = React.useState(1);

  const { data: leadsResponse, isLoading, isError, error } = useLeads({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteLead();
  const archiveMutation = useArchiveLead();

  const handleCreate = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleArchive = async (lead: Lead) => {
    if (confirm(`Tem certeza que deseja arquivar o lead "${lead.title}"?`)) {
      try {
        await archiveMutation.mutateAsync(lead.id);
        toast.success('Lead arquivado com sucesso.');
      } catch (e: any) {
        toast.error('Erro ao arquivar lead.');
      }
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente o lead "${lead.title}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteMutation.mutateAsync(lead.id);
        toast.success('Lead excluído com sucesso.');
      } catch (e: any) {
        toast.error('Erro ao excluir lead. Pode haver dados vinculados.');
      }
    }
  };

  const columns = [
    { 
      accessorKey: 'title', 
      header: 'Oportunidade',
      cell: ({ row }: { row: { original: Lead } }) => (
        <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
          <Target className="h-4 w-4" />
          {row.original.title}
        </div>
      )
    },
    { 
      accessorKey: 'contact', 
      header: 'Contato Principal',
      cell: ({ row }: { row: { original: Lead } }) => {
        const contactName = row.original.contact 
          ? `${row.original.contact.firstName} ${row.original.contact.lastName || ''}`.trim()
          : '-';
        return (
          <div className="flex flex-col">
            <span>{contactName}</span>
            <span className="text-xs text-muted-foreground">{row.original.organization?.name || '-'}</span>
          </div>
        );
      }
    },
    { 
      accessorKey: 'value', 
      header: 'Valor Previsto',
      cell: ({ row }: { row: { original: Lead } }) => {
        const val = row.original.estimatedValue;
        if (!val) return <span className="text-muted-foreground">-</span>;
        return <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span>;
      }
    },
    { 
      accessorKey: 'score', 
      header: 'Score',
      cell: ({ row }: { row: { original: Lead } }) => {
        const score = row.original.score || 0;
        const isHot = score >= 80;
        return (
          <div className="flex items-center gap-1">
            {isHot && <Flame className="h-4 w-4 text-orange-500" />}
            <span className={`font-semibold ${isHot ? 'text-orange-500' : 'text-muted-foreground'}`}>{score}</span>
          </div>
        );
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }: { row: { original: Lead } }) => {
        const status = row.original.status;
        const variant = status === 'NEW' ? 'default' : status === 'CONTACTED' ? 'secondary' : 'outline';
        return <Badge variant={variant as any}>{status}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Lead } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleArchive(row.original)}
              className="text-red-600 focus:text-red-600"
              disabled={row.original.status === 'LOST'}
            >
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">Falha ao carregar leads. Verifique sua conexão ou tente novamente mais tarde.</p>
        <p className="text-sm text-muted-foreground">{String((error as any)?.response?.data?.message || error?.message)}</p>
      </div>
    );
  }

  const leads = leadsResponse?.data || [];
  const meta = leadsResponse?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads e Oportunidades</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as intenções de negócio em estágio inicial.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Lead
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar leads..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filtros Avançados</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Target className="h-10 w-10 text-muted-foreground" />}
            title="Nenhuma oportunidade encontrada"
            description={searchTerm ? "Não encontramos leads com os termos buscados." : "Você ainda não possui leads cadastrados."}
            action={
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Lead
              </Button>
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={leads} />
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

      <LeadFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={selectedLead}
      />
    </div>
  );
}
