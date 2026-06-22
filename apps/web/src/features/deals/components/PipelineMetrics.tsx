import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, DollarSign, Target, TrendingUp } from 'lucide-react';
import { Deal } from '../api/use-deals';

interface PipelineMetricsProps {
  deals: Deal[];
}

export function PipelineMetrics({ deals }: PipelineMetricsProps) {
  const totalDeals = deals.length;
  
  const totalValue = deals.reduce((acc, deal) => {
    if (deal.status === 'WON' || deal.status === 'LOST' || deal.status === 'ARCHIVED') return acc;
    return acc + (Number(deal.value) || 0);
  }, 0);

  const wonDeals = deals.filter(d => d.status === 'WON');
  const wonValue = wonDeals.reduce((acc, deal) => acc + (Number(deal.value) || 0), 0);
  
  const averageTicket = wonDeals.length > 0 ? wonValue / wonDeals.length : 0;
  
  const closedDealsCount = deals.filter(d => d.status === 'WON' || d.status === 'LOST').length;
  const conversionRate = closedDealsCount > 0 ? (wonDeals.length / closedDealsCount) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Oportunidades Abertas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deals.filter(d => d.status === 'OPEN').length}</div>
          <p className="text-xs text-muted-foreground">
            De um total de {totalDeals} negócios
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor em Pipeline</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Soma de oportunidades abertas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio (Ganhos)</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em negócios fechados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Ganho x Perdido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
