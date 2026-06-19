import * as React from 'react';
import { Plus, Search, MoreHorizontal, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const stages = [
  { id: '1', name: 'Qualificação', color: 'border-blue-500' },
  { id: '2', name: 'Proposta', color: 'border-yellow-500' },
  { id: '3', name: 'Negociação', color: 'border-orange-500' },
  { id: '4', name: 'Fechamento', color: 'border-emerald-500' },
];

const dealsData = [
  { id: 'd1', title: 'Licenças Enterprise', company: 'Tech Solutions', value: 'R$ 42.000', stageId: '2', probability: 60 },
  { id: 'd2', title: 'Integração CRM Legado', company: 'Acme Corp', value: 'R$ 15.000', stageId: '1', probability: 20 },
  { id: 'd3', title: 'Consultoria Premium', company: 'Global Services', value: 'R$ 8.500', stageId: '3', probability: 80 },
  { id: 'd4', title: 'Upgrade de Plano', company: 'InovaTech', value: 'R$ 12.000', stageId: '4', probability: 95 },
  { id: 'd5', title: 'Expansão de Contas', company: 'Alpha Ind.', value: 'R$ 35.000', stageId: '2', probability: 50 },
];

export function DealsBoardPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1">Gerencie e mova seus negócios através das etapas do funil.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar negócios..." className="pl-8" />
        </div>
        <Button variant="outline">Pipeline de Vendas (Default)</Button>
        <Button variant="outline">Filtros</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {stages.map(stage => {
          const stageDeals = dealsData.filter(d => d.stageId === stage.id);
          const totalValue = stageDeals.reduce((acc, curr) => {
            const val = parseInt(curr.value.replace(/\D/g, ''));
            return acc + val;
          }, 0);

          return (
            <div key={stage.id} className="flex flex-col gap-4 min-w-[300px] w-[300px]">
              <div className={`flex items-center justify-between border-t-4 pt-3 ${stage.color}`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{stage.name}</h3>
                  <Badge variant="secondary">{stageDeals.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm font-medium text-muted-foreground mb-2">
                R$ {totalValue.toLocaleString('pt-BR')}
              </div>

              <div className="flex flex-col gap-3">
                {stageDeals.map(deal => (
                  <div key={deal.id} className="bg-card border rounded-lg p-4 shadow-sm cursor-grab hover:border-emerald-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{deal.title}</h4>
                      <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 -mr-1">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{deal.company}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {deal.value}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {deal.probability}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
