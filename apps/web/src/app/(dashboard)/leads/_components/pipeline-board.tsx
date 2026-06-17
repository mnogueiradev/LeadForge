'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { toast } from 'sonner';

type Lead = {
  id: string;
  title: string;
  status: string;
  temperature: string;
  estimatedValue: string | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
};

const COLUMNS = [
  { id: 'NEW', title: 'Novo' },
  { id: 'CONTACTED', title: 'Contatado' },
  { id: 'QUALIFIED', title: 'Qualificado' },
  { id: 'CONVERTED', title: 'Convertido' },
  { id: 'LOST', title: 'Perdido' },
];

export function PipelineBoard() {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Record<string, Lead[]>>({});

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await api.get('/leads');
      return response.data.data as Lead[];
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/leads/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  useEffect(() => {
    if (leads) {
      const newCols: Record<string, Lead[]> = {};
      COLUMNS.forEach((col) => {
        newCols[col.id] = leads.filter((l) => l.status === col.id);
      });
      // Colocar os leads com status não mapeados na primeira coluna
      const mappedStatuses = COLUMNS.map(c => c.id);
      const unmapped = leads.filter(l => !mappedStatuses.includes(l.status));
      if (unmapped.length > 0 && newCols['NEW']) {
        newCols['NEW'] = [...newCols['NEW'], ...unmapped];
      }
      setColumns(newCols);
    }
  }, [leads]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = [...(columns[source.droppableId] || [])];
    const destColumn = [...(columns[destination.droppableId] || [])];
    const [movedLead] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedLead);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
      });
    } else {
      movedLead.status = destination.droppableId;
      destColumn.splice(destination.index, 0, movedLead);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });

      // API call
      updateLeadStatus.mutate({ id: draggableId, status: destination.droppableId });
    }
  };

  if (isLoading) {
    return <div>Carregando quadro...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className="min-w-[300px] w-[300px] flex flex-col bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary">
                {columns[column.id]?.length || 0}
              </Badge>
            </div>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 flex flex-col gap-2 min-h-[150px]"
                >
                  {columns[column.id]?.map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={provided.draggableProps.style as React.CSSProperties}
                          className={`shadow-sm ${snapshot.isDragging ? 'shadow-md border-primary/50' : ''}`}
                        >
                          <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                            <CardTitle className="text-sm font-medium leading-none">
                              {lead.title}
                            </CardTitle>
                            <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab">
                              <GripVertical className="h-4 w-4" />
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-xs text-muted-foreground mt-1">
                              {lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName || ''}` : 'Sem contato'}
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Badge variant="outline" className="text-[10px]">
                                {lead.temperature}
                              </Badge>
                              {lead.estimatedValue && (
                                <span className="text-xs font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(lead.estimatedValue))}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
