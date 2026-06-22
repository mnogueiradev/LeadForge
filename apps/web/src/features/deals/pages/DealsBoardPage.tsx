import * as React from 'react';
import { Plus, MoreHorizontal, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { usePipelines, usePipelineStages, useReorderPipelineStages } from '../../pipelines/api/use-pipelines';
import { useDeals, useMoveDealStage, useDeleteDeal, Deal } from '../api/use-deals';
import { StageHeader } from '../components/StageHeader';
import { CreateDealModal } from '../components/CreateDealModal';
import { DealDrawer } from '../components/DealDrawer';
import { PipelineMetrics } from '../components/PipelineMetrics';
import { DealsFilters } from '../components/DealsFilters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function DealsBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search') || undefined;
  const ownerUserId = searchParams.get('ownerUserId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const pipelineIdParam = searchParams.get('pipeline') || undefined;

  const { data: pipelinesResponse, isLoading: isLoadingPipelines } = usePipelines();
  const pipelines = pipelinesResponse?.items || [];
  
  // Smart default logic
  const defaultPipeline = pipelines.find(p => p.isDefault) || pipelines[0];
  const activePipelineId = pipelineIdParam || defaultPipeline?.id;
  
  React.useEffect(() => {
     // Persist in URL if not present but we have one
     if (activePipelineId && !pipelineIdParam) {
        setSearchParams(prev => {
          prev.set('pipeline', activePipelineId);
          return prev;
        }, { replace: true });
     }
  }, [activePipelineId, pipelineIdParam, setSearchParams]);

  const { data: stagesData, isLoading: isLoadingStages } = usePipelineStages(activePipelineId, { enabled: !!activePipelineId });
  
  // Custom filtering since our useDeals API might not support all query params yet, or we can filter locally.
  const { data: dealsResponse, isLoading: isLoadingDeals } = useDeals({ 
    pipelineId: activePipelineId, 
    limit: 1000,
    status
  });

  const reorderStagesMutation = useReorderPipelineStages();
  const moveDealMutation = useMoveDealStage();
  const deleteDealMutation = useDeleteDeal();

  // Local state for optimistic UI updates during drag
  const [orderedStages, setOrderedStages] = React.useState(stagesData || []);
  const [deals, setDeals] = React.useState<Deal[]>(dealsResponse || []);

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedStageId, setSelectedStageId] = React.useState<string | undefined>();
  
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedDealId, setSelectedDealId] = React.useState<string | null>(null);

  // Sync state when data fetches
  React.useEffect(() => {
    if (stagesData) {
      setOrderedStages([...stagesData].sort((a, b) => a.displayOrder - b.displayOrder));
    } else if (!isLoadingStages) {
      setOrderedStages([]);
    }
  }, [stagesData, isLoadingStages]);

  React.useEffect(() => {
    if (dealsResponse) {
      let filteredDeals = [...dealsResponse];
      
      // Apply local filters if API doesn't support them fully yet
      if (search) {
        filteredDeals = filteredDeals.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.organization?.name?.toLowerCase().includes(search.toLowerCase()));
      }
      
      if (ownerUserId) {
        filteredDeals = filteredDeals.filter(d => d.ownerUserId === ownerUserId);
      }

      setDeals(filteredDeals);
    }
  }, [dealsResponse, search, ownerUserId]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'stage') {
      // Reordering stages
      const newOrderedStages = Array.from(orderedStages);
      const [movedStage] = newOrderedStages.splice(source.index, 1);
      newOrderedStages.splice(destination.index, 0, movedStage);
      
      const updatedStages = newOrderedStages.map((stage, index) => ({
        ...stage,
        displayOrder: index * 10,
      }));

      setOrderedStages(updatedStages);

      if (activePipelineId) {
        reorderStagesMutation.mutate({
          pipelineId: activePipelineId,
          stages: updatedStages.map(s => ({ id: s.id, displayOrder: s.displayOrder })),
        });
      }
      return;
    }

    if (type === 'deal') {
      // Moving deals
      const newDeals = Array.from(deals);
      const movedDealIndex = newDeals.findIndex(d => d.id === draggableId);
      if (movedDealIndex === -1) return;

      const movedDeal = newDeals[movedDealIndex];
      const sourceStageId = source.droppableId;
      const destinationStageId = destination.droppableId;

      // Optimistically update deal's stage
      const updatedDeal = { ...movedDeal, stageId: destinationStageId };
      newDeals[movedDealIndex] = updatedDeal;
      setDeals(newDeals);

      if (sourceStageId !== destinationStageId) {
        try {
          await moveDealMutation.mutateAsync({
            id: movedDeal.id,
            toStageId: destinationStageId,
          });
          toast.success('Negócio movido com sucesso');
        } catch (error) {
          toast.error('Erro ao mover o negócio');
          // Revert optimistic update on error
          setDeals(dealsResponse || []);
        }
      }
    }
  };

  const handleAddDeal = (stageId?: string) => {
    setSelectedStageId(stageId);
    setIsCreateModalOpen(true);
  };

  const handleDeleteDeal = async (e: React.MouseEvent, dealId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este negócio? Esta ação não pode ser desfeita.')) {
      try {
        await deleteDealMutation.mutateAsync(dealId);
        toast.success('Negócio excluído com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir negócio');
      }
    }
  };

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDrawerOpen(true);
  };

  if (isLoadingPipelines || isLoadingStages || isLoadingDeals) {
    return <div className="flex items-center justify-center h-full">Carregando painel de negócios...</div>;
  }

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Nenhum pipeline encontrado</h2>
        <p className="text-muted-foreground">Crie um pipeline primeiro em Configurações para começar a gerenciar seus negócios.</p>
        <Button onClick={() => navigate('/pipelines')}>Criar Pipeline</Button>
      </div>
    );
  }

  if (!activePipelineId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Erro ao carregar pipeline</h2>
        <p className="text-muted-foreground">O pipeline selecionado não existe ou você não tem acesso.</p>
        <Button onClick={() => navigate('/pipelines')}>Ver Pipelines</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
            <p className="text-muted-foreground mt-1">Gerencie e mova seus negócios através das etapas do funil.</p>
          </div>
          
          <div className="w-64 border-l pl-6 hidden md:block">
            <Select 
              value={activePipelineId} 
              onValueChange={(val) => {
                setSearchParams(prev => { prev.set('pipeline', val); return prev; });
              }}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Selecione um pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAddDeal()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      <PipelineMetrics deals={deals} />
      <DealsFilters />

      {deals.length === 0 && !search && !ownerUserId && !status ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-dashed shadow-sm">
          <h2 className="text-xl font-bold mb-2">Nenhum negócio encontrado</h2>
          <p className="text-muted-foreground mb-4">Crie sua primeira oportunidade de venda no funil.</p>
          <Button onClick={() => handleAddDeal()}>Criar Negócio</Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="stage" direction="horizontal">
            {(provided) => (
              <div 
                className="flex gap-6 overflow-x-auto pb-4 flex-1 h-full min-h-[500px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {orderedStages.map((stage, index) => {
                  const stageDeals = deals.filter(d => d.stageId === stage.id);
                  const totalValue = stageDeals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

                  return (
                    <Draggable key={stage.id} draggableId={`stage-${stage.id}`} index={index}>
                      {(providedStage) => (
                        <div 
                          className="flex flex-col gap-4 min-w-[300px] w-[300px] bg-muted/30 rounded-xl p-3"
                          ref={providedStage.innerRef}
                          {...providedStage.draggableProps}
                          style={providedStage.draggableProps.style as any}
                        >
                          <StageHeader 
                            stage={stage} 
                            dealsCount={stageDeals.length} 
                            onAddDeal={() => handleAddDeal(stage.id)}
                            dragHandleProps={providedStage.dragHandleProps}
                          />
                          
                          <div className="text-sm font-medium text-muted-foreground -mt-2 mb-1 px-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                          </div>

                          <Droppable droppableId={stage.id} type="deal">
                            {(providedDeals, snapshot) => (
                              <div 
                                className={`flex flex-col gap-3 min-h-[150px] p-1 rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-muted/80' : ''}`}
                                ref={providedDeals.innerRef}
                                {...providedDeals.droppableProps}
                              >
                                {stageDeals.map((deal, dealIndex) => (
                                  <Draggable key={deal.id} draggableId={deal.id} index={dealIndex}>
                                    {(providedDeal, dealSnapshot) => (
                                      <div 
                                        className={`bg-card border rounded-lg p-4 shadow-sm hover:border-emerald-500 cursor-pointer transition-colors ${dealSnapshot.isDragging ? 'rotate-2 scale-105 shadow-md border-emerald-500 z-50' : ''}`}
                                        ref={providedDeal.innerRef}
                                        {...providedDeal.draggableProps}
                                        {...providedDeal.dragHandleProps}
                                        style={providedDeal.draggableProps.style as any}
                                        onClick={() => handleDealClick(deal.id)}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-sm leading-tight pr-2">{deal.title}</h4>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 -mr-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                              <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onClick={(e) => handleDeleteDeal(e, deal.id)}
                                              >
                                                Excluir Negócio
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                        {deal.organization?.name && (
                                          <p className="text-xs text-muted-foreground mb-3">{deal.organization.name}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto pt-2">
                                          <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.value || 0))}
                                          </div>
                                          {deal.probability > 0 && (
                                            <Badge variant="outline" className="text-[10px]">
                                              {deal.probability}%
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {providedDeals.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {activePipelineId && (
        <CreateDealModal 
          open={isCreateModalOpen} 
          onOpenChange={setIsCreateModalOpen} 
          pipelineId={activePipelineId} 
          defaultStageId={selectedStageId}
        />
      )}

      <DealDrawer 
        dealId={selectedDealId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}
