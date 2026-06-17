'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';

type Lead = {
  id: string;
  title: string;
  status: string;
  temperature: string;
  estimatedValue: string | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'NEW':
      return <Badge variant="default">{status}</Badge>;
    case 'QUALIFYING':
    case 'MEETING_SCHEDULED':
    case 'PROPOSAL_SENT':
      return <Badge variant="secondary">{status}</Badge>;
    case 'CONVERTED':
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">{status}</Badge>;
    case 'LOST':
    case 'DISQUALIFIED':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTemperatureBadge = (temp: string) => {
  switch (temp) {
    case 'HOT':
      return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">{temp}</Badge>;
    case 'WARM':
      return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">{temp}</Badge>;
    case 'COLD':
      return <Badge variant="outline" className="text-blue-500 border-blue-500">{temp}</Badge>;
    default:
      return <Badge variant="outline">{temp}</Badge>;
  }
};

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'contact',
    header: 'Contato',
    cell: ({ row }) => {
      const contact = row.original.contact;
      return contact ? `${contact.firstName} ${contact.lastName || ''}` : '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: 'temperature',
    header: 'Temperatura',
    cell: ({ row }) => getTemperatureBadge(row.original.temperature),
  },
  {
    accessorKey: 'estimatedValue',
    header: 'Valor',
    cell: ({ row }) => {
      const value = row.original.estimatedValue;
      if (!value) return '-';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
    },
  },
];

export function LeadList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await api.get('/leads');
      return response.data.data as Lead[];
    },
  });

  if (isLoading) {
    return <div>Carregando leads...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar os leads.</div>;
  }

  return <DataTable columns={columns} data={data || []} />;
}
