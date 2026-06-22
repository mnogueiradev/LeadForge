import * as React from 'react';
import { Plus, Search, User, MoreHorizontal, Mail, Phone, Pencil, Archive, Trash2 } from 'lucide-react';
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

import { useContacts, useArchiveContact, useDeleteContact, Contact } from '../api/use-contacts';
import { ContactFormModal } from '../components/contact-form-modal';
import { useDebounce } from '@/hooks/use-debounce';

export function ContactsListPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = React.useState(1);

  const { data: contactsResponse, isLoading, isError, error } = useContacts({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const archiveMutation = useArchiveContact();
  const deleteMutation = useDeleteContact();

  const handleCreate = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleArchive = async (contact: Contact) => {
    if (confirm(`Tem certeza que deseja arquivar o contato ${contact.firstName}?`)) {
      try {
        await archiveMutation.mutateAsync(contact.id);
        toast.success('Contato arquivado com sucesso.');
      } catch (e: any) {
        toast.error('Erro ao arquivar contato.');
      }
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (confirm(`Deseja realmente excluir permanentemente o contato "${contact.firstName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteMutation.mutateAsync(contact.id);
        toast.success('Contato excluído com sucesso!');
      } catch (err) {
        toast.error('Erro ao excluir contato. Pode haver dados vinculados a ele.');
      }
    }
  };

  const columns = [
    { 
      accessorKey: 'name', 
      header: 'Nome do Contato',
      cell: ({ row }: { row: { original: Contact } }) => {
        const name = `${row.original.firstName} ${row.original.lastName || ''}`.trim();
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{row.original.jobTitle || 'Sem cargo'}</span>
            </div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'company', 
      header: 'Empresa',
      cell: ({ row }: { row: { original: Contact } }) => {
        const companyName = row.original.organization?.name;
        return companyName ? (
          <Badge variant="outline">{companyName}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      }
    },
    { 
      accessorKey: 'email', 
      header: 'Email',
      cell: ({ row }: { row: { original: Contact } }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3 w-3" />
          {row.original.primaryEmail || '-'}
        </div>
      )
    },
    { 
      accessorKey: 'phone', 
      header: 'Telefone',
      cell: ({ row }: { row: { original: Contact } }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3 w-3" />
          {row.original.primaryPhone || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Contact } }) => (
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
        <p className="text-red-500 mb-4">Falha ao carregar contatos. Verifique sua conexão ou tente novamente mais tarde.</p>
        <p className="text-sm text-muted-foreground">{String((error as any)?.response?.data?.message || error?.message)}</p>
      </div>
    );
  }

  const contacts = contactsResponse?.data || [];
  const meta = contactsResponse?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground mt-1">Sua agenda centralizada de pessoas e tomadores de decisão.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar contatos..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filtros</Button>
        <Button variant="outline">Importar</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<User className="h-10 w-10 text-muted-foreground" />}
            title="Nenhum contato encontrado"
            description={searchTerm ? "Não encontramos contatos com os termos buscados." : "Você ainda não possui contatos cadastrados."}
            action={
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={contacts} />
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

      <ContactFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}
