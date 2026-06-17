'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';

type Organization = {
  id: string;
  name: string;
  document: string | null;
  status: string;
  industry: string | null;
};

const formatDocument = (doc: string | null) => {
  if (!doc) return '-';
  const cleanDoc = doc.replace(/\D/g, '');
  if (cleanDoc.length === 14) {
    return cleanDoc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  } else if (cleanDoc.length === 11) {
    return cleanDoc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return doc;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'CUSTOMER':
      return <Badge variant="default">{status}</Badge>;
    case 'PROSPECT':
      return <Badge variant="secondary">{status}</Badge>;
    case 'ARCHIVED':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'document',
    header: 'Documento',
    cell: ({ row }) => formatDocument(row.getValue('document')),
  },
  {
    accessorKey: 'industry',
    header: 'Segmento',
    cell: ({ row }) => row.getValue('industry') || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
];

export function OrganizationList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data.data as Organization[];
    },
  });

  if (isLoading) {
    return <div>Carregando empresas...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar as empresas.</div>;
  }

  return <DataTable columns={columns} data={data || []} />;
}
