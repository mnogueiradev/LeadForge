'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Contact = {
  id: string;
  firstName: string;
  lastName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  status: string;
  jobTitle: string | null;
  organization: { id: string; name: string } | null;
  avatarUrl: string | null;
};

const getInitials = (firstName: string, lastName: string | null) => {
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="default">{status}</Badge>;
    case 'INACTIVE':
      return <Badge variant="secondary">{status}</Badge>;
    case 'ARCHIVED':
    case 'BLOCKED':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={contact.avatarUrl || ''} />
            <AvatarFallback>{getInitials(contact.firstName, contact.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{contact.firstName} {contact.lastName || ''}</div>
            <div className="text-xs text-muted-foreground">{contact.jobTitle || ''}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'organization',
    header: 'Empresa',
    cell: ({ row }) => row.original.organization?.name || '-',
  },
  {
    accessorKey: 'primaryEmail',
    header: 'E-mail',
    cell: ({ row }) => row.original.primaryEmail || '-',
  },
  {
    accessorKey: 'primaryPhone',
    header: 'Telefone',
    cell: ({ row }) => row.original.primaryPhone || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
];

export function ContactList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.get('/contacts');
      return response.data.data as Contact[];
    },
  });

  if (isLoading) {
    return <div>Carregando contatos...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar os contatos.</div>;
  }

  return <DataTable columns={columns} data={data || []} />;
}
