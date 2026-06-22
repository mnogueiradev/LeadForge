import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { usePipelines, useArchivePipeline, useDeletePipeline, Pipeline } from '../api/use-pipelines';
import { PipelineCard } from '../components/PipelineCard';
import { CreatePipelineModal } from '../components/CreatePipelineModal';
import { EditPipelineModal } from '../components/EditPipelineModal';

export function PipelinesPage() {
  const { data: pipelinesResponse, isLoading, isError } = usePipelines();
  const pipelines = pipelinesResponse?.items || [];
  
  const archivePipelineMutation = useArchivePipeline();
  const deletePipelineMutation = useDeletePipeline();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);

  const handleArchive = async (pipeline: Pipeline) => {
    if (confirm(`Tem certeza que deseja arquivar o pipeline "${pipeline.name}"?`)) {
      try {
        await archivePipelineMutation.mutateAsync(pipeline.id);
        toast.success('Pipeline arquivado com sucesso.');
      } catch (e: any) {
        toast.error('Erro ao arquivar pipeline.');
      }
    }
  };

  const handleDelete = async (pipeline: Pipeline) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente o pipeline "${pipeline.name}"? Esta ação não pode ser desfeita e removerá todos os estágios vinculados.`)) {
      try {
        await deletePipelineMutation.mutateAsync(pipeline.id);
        toast.success('Pipeline excluído com sucesso.');
      } catch (e: any) {
        toast.error('Erro ao excluir pipeline.');
      }
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Carregando pipelines...</div>;
  }

  if (isError) {
    return <div className="flex h-full items-center justify-center text-red-500">Erro ao carregar pipelines.</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
          <p className="text-muted-foreground mt-1">Gerencie os funis de vendas da sua operação.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pipeline
        </Button>
      </div>

      {pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-card rounded-xl border border-dashed p-10 text-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
            <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum pipeline encontrado</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Crie seu primeiro funil de vendas para começar a organizar seus negócios e leads.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Criar Pipeline
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pipelines.map((pipeline) => (
            <PipelineCard 
              key={pipeline.id} 
              pipeline={pipeline} 
              onEdit={setPipelineToEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreatePipelineModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />

      <EditPipelineModal 
        pipeline={pipelineToEdit} 
        open={!!pipelineToEdit} 
        onOpenChange={(open) => !open && setPipelineToEdit(null)} 
      />
    </div>
  );
}
