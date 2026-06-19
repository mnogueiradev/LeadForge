import * as React from 'react';
import { Plus, Search, User, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const contactsData = [
  { id: '1', name: 'João Souza', email: 'joao@acme.com', phone: '(11) 98765-4321', company: 'Acme Corp', role: 'CTO' },
  { id: '2', name: 'Maria Silva', email: 'maria@techsol.io', phone: '(11) 91234-5678', company: 'Tech Solutions', role: 'CEO' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@global.com', phone: '(21) 99876-5432', company: 'Global Services', role: 'Gerente de Vendas' },
  { id: '4', name: 'Ana Alves', email: 'ana@inovatech.br', phone: '(31) 98888-7777', company: 'InovaTech', role: 'Diretora de RH' },
  { id: '5', name: 'Lucas Oliveira', email: 'lucas@alpha.ind.br', phone: '(41) 97777-6666', company: 'Alpha Indústria', role: 'Engenheiro Chefe' },
];

const columns = [
  { 
    accessorKey: 'name', 
    header: 'Nome do Contato',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
          <span className="text-xs text-muted-foreground">{row.original.role}</span>
        </div>
      </div>
    )
  },
  { 
    accessorKey: 'company', 
    header: 'Empresa',
    cell: ({ row }: any) => (
      <Badge variant="outline">{row.getValue('company')}</Badge>
    )
  },
  { 
    accessorKey: 'email', 
    header: 'Email',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="h-3 w-3" />
        {row.getValue('email')}
      </div>
    )
  },
  { 
    accessorKey: 'phone', 
    header: 'Telefone',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Phone className="h-3 w-3" />
        {row.getValue('phone')}
      </div>
    )
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

export function ContactsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground mt-1">Sua agenda centralizada de pessoas e tomadores de decisão.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contatos..." className="pl-8" />
        </div>
        <Button variant="outline">Filtros</Button>
        <Button variant="outline">Importar</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm">
        <DataTable columns={columns} data={contactsData} />
      </div>
    </div>
  );
}
