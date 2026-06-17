import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List as ListIcon, Kanban } from 'lucide-react';
import Link from 'next/link';
import { LeadList } from './_components/lead-list';
import { PipelineBoard } from './_components/pipeline-board';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeadsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leads (Oportunidades)</h2>
        <div className="flex items-center space-x-2">
          <Link href="/leads/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">
            <Kanban className="mr-2 h-4 w-4" />
            Quadro (Kanban)
          </TabsTrigger>
          <TabsTrigger value="list">
            <ListIcon className="mr-2 h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Vendas</CardTitle>
              <CardDescription>
                Arraste os leads entre as colunas para atualizar o status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineBoard />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Leads</CardTitle>
              <CardDescription>
                Gerencie suas oportunidades comerciais em formato de tabela.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
