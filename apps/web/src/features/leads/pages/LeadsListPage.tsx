import * as React from 'react';
import { Plus, Search, Target, MoreHorizontal, ArrowUpRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const leadsData = [
  { id: '1', title: 'Integração CRM Legado', contact: 'João Souza', company: 'Acme Corp', value: 'R$ 15.000', score: 85, status: 'Novo' },
  { id: '2', title: 'Licenças Enterprise', contact: 'Maria Silva', company: 'Tech Solutions', value: 'R$ 42.000', score: 95, status: 'Qualificado' },
  { id: '3', title: 'Consultoria de Migração', contact: 'Pedro Costa', company: 'Global Services', value: 'R$ 8.500', score: 45, status: 'Em Contato' },
  { id: '4', title: 'Treinamento Equipe', contact: 'Ana Alves', company: 'InovaTech', value: 'R$ 5.200', score: 60, status: 'Novo' },
];

const columns = [
  { 
    accessorKey: 'title', 
    header: 'Oportunidade',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
        <Target className="h-4 w-4" />
        {row.getValue('title')}
      </div>
    )
  },
  { 
    accessorKey: 'contact', 
    header: 'Contato Principal',
    cell: ({ row }: any) => (
      <div className="flex flex-col">
        <span>{row.getValue('contact')}</span>
        <span className="text-xs text-muted-foreground">{row.original.company}</span>
      </div>
    )
  },
  { accessorKey: 'value', header: 'Valor Previsto' },
  { 
    accessorKey: 'score', 
    header: 'Score',
    cell: ({ row }: any) => {
      const score = row.getValue('score') as number;
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
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const variant = status === 'Novo' ? 'default' : status === 'Em Contato' ? 'secondary' : 'outline';
      return <Badge variant={variant as any}>{status}</Badge>;
    }
  },
  {
    id: 'actions',
    cell: () => (
      <Button variant="ghost" size="icon">
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    )
  }
];

export function LeadsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads e Oportunidades</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as intenções de negócio em estágio inicial.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Lead
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar leads..." className="pl-8" />
        </div>
        <Button variant="outline">Filtros Avançados</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm">
        <DataTable columns={columns} data={leadsData} />
      </div>
    </div>
  );
}
