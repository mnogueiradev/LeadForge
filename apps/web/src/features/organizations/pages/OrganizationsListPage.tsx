import * as React from 'react';
import { Plus, Search, Building2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const organizationsData = [
  { id: '1', name: 'Acme Corp', industry: 'Tecnologia', website: 'acme.com', owner: 'Carlos Admin', status: 'Cliente' },
  { id: '2', name: 'Global Services', industry: 'Consultoria', website: 'global.com', owner: 'Ana Silva', status: 'Prospecção' },
  { id: '3', name: 'Tech Solutions', industry: 'Software', website: 'techsol.io', owner: 'Pedro Costa', status: 'Cliente' },
  { id: '4', name: 'InovaTech', industry: 'Inovação', website: 'inovatech.br', owner: 'Maria Souza', status: 'Perdido' },
  { id: '5', name: 'Alpha Indústria', industry: 'Manufatura', website: 'alpha.ind.br', owner: 'Carlos Admin', status: 'Prospecção' },
];

const columns = [
  { 
    accessorKey: 'name', 
    header: 'Nome da Empresa',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 font-medium">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {row.getValue('name')}
      </div>
    )
  },
  { accessorKey: 'industry', header: 'Segmento' },
  { 
    accessorKey: 'website', 
    header: 'Website',
    cell: ({ row }: any) => (
      <a href={`https://${row.getValue('website')}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
        {row.getValue('website')}
      </a>
    )
  },
  { accessorKey: 'owner', header: 'Responsável' },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const variant = status === 'Cliente' ? 'default' : status === 'Prospecção' ? 'secondary' : 'destructive';
      return <Badge variant={variant as any}>{status}</Badge>;
    }
  },
  {
    id: 'actions',
    cell: () => (
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    )
  }
];

export function OrganizationsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as organizações e clientes do seu CRM.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar empresas..." className="pl-8" />
        </div>
        <Button variant="outline">Filtros</Button>
        <Button variant="outline">Exportar</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm">
        <DataTable columns={columns} data={organizationsData} />
      </div>
    </div>
  );
}
