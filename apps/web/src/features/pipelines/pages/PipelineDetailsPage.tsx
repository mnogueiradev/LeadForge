import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, GripVertical, Trash2, Pencil } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  usePipeline,
  usePipelineStages,
  useReorderPipelineStages,
  useDeletePipelineStage,
  PipelineStage
} from '../api/use-pipelines';
import { StageFormModal } from '../components/StageFormModal';

export function PipelineDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pipeline, isLoading: isLoadingPipeline, isError: isErrorPipeline } = usePipeline(id);
  const { data: stagesData, isLoading: isLoadingStages } = usePipelineStages(id);
  const reorderMutation = useReorderPipelineStages();
  const deleteMutation = useDeletePipelineStage();

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageToEdit, setStageToEdit] = useState<PipelineStage | null>(null);

  useEffect(() => {
    if (stagesData) {
      // Sort by displayOrder just in case
      setStages([...stagesData].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [stagesData]);

  if (isLoadingPipeline || isLoadingStages) {
    return <div className="flex h-full items-center justify-center">Carregando detalhes...</div>;
  }

  if (isErrorPipeline || !pipeline) {
    return <div className="flex h-full items-center justify-center text-red-500">Pipeline não encontrado.</div>;
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for optimistic UI
    setStages(items);

    // Prepare payload
    const reorderedPayload = items.map((stage, index) => ({
      id: stage.id,
      displayOrder: index,
    }));

    try {
      if (id) {
        await reorderMutation.mutateAsync({ pipelineId: id, stages: reorderedPayload });
      }
    } catch (error) {
      toast.error('Erro ao reordenar estágios.');
      // Revert state if failed
      if (stagesData) {
        setStages([...stagesData].sort((a, b) => a.displayOrder - b.displayOrder));
      }
    }
  };

  const handleDeleteStage = async (stageId: string, stageName: string) => {
    if (confirm(`Tem certeza que deseja excluir o estágio "${stageName}"? Negócios neste estágio podem ser afetados.`)) {
      if (id) {
        try {
          await deleteMutation.mutateAsync({ pipelineId: id, stageId });
          toast.success('Estágio excluído com sucesso.');
        } catch (error) {
          toast.error('Erro ao excluir estágio.');
        }
      }
    }
  };

  const handleEditStage = (stage: PipelineStage) => {
    setStageToEdit(stage);
    setIsStageModalOpen(true);
  };

  const handleCreateStage = () => {
    setStageToEdit(null);
    setIsStageModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pipelines')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{pipeline.name}</h1>
            <Badge variant={pipeline.isActive ? "default" : "secondary"}>
              {pipeline.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            {pipeline.isDefault && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                Padrão
              </Badge>
            )}
          </div>
          {pipeline.description && (
            <p className="text-muted-foreground mt-1">{pipeline.description}</p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-6 border-b flex justify-between items-center bg-muted/20">
          <div>
            <h2 className="text-xl font-semibold">Estágios do Funil</h2>
            <p className="text-sm text-muted-foreground">Arraste para reordenar os estágios.</p>
          </div>
          <Button onClick={handleCreateStage} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Estágio
          </Button>
        </div>

        <div className="p-6">
          {stages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum estágio configurado para este pipeline.</p>
              <Button variant="link" onClick={handleCreateStage} className="mt-2 text-emerald-600">
                Criar primeiro estágio
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="stages-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {stages.map((stage, index) => (
                      <Draggable key={stage.id} draggableId={stage.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={provided.draggableProps.style as any}
                            className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm hover:border-emerald-200 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="flex items-center gap-3">
                                {stage.color && (
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: stage.color }}
                                  />
                                )}
                                <span className="font-medium text-lg">{stage.name}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {stage.probability}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditStage(stage)}
                                className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteStage(stage.id, stage.name)}
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {id && (
        <StageFormModal 
          pipelineId={id}
          stageToEdit={stageToEdit}
          open={isStageModalOpen}
          onOpenChange={setIsStageModalOpen}
        />
      )}
    </div>
  );
}
