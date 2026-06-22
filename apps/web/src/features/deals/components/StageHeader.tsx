import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PipelineStage, useUpdatePipelineStage } from '../../pipelines/api/use-pipelines';
import { toast } from 'sonner';

interface StageHeaderProps {
  stage: PipelineStage;
  dealsCount: number;
  onAddDeal?: () => void;
  dragHandleProps?: any;
}

export function StageHeader({ stage, dealsCount, onAddDeal, dragHandleProps }: StageHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(stage.name);
  const updateStageMutation = useUpdatePipelineStage();

  const handleSave = async () => {
    if (name.trim() === '') {
      setName(stage.name);
      setIsEditing(false);
      return;
    }

    if (name !== stage.name) {
      try {
        await updateStageMutation.mutateAsync({
          pipelineId: stage.pipelineId,
          stageId: stage.id,
          payload: { name },
        });
        toast.success('Etapa renomeada com sucesso');
      } catch (error) {
        toast.error('Erro ao renomear etapa');
        setName(stage.name);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(stage.name);
      setIsEditing(false);
    }
  };

  // Fallback color if null
  const colorClass = stage.color || 'border-slate-500';

  return (
    <div 
      className={`flex items-center justify-between border-t-4 pt-3 ${colorClass}`}
      {...dragHandleProps}
    >
      <div className="flex items-center gap-2 flex-1">
        {isEditing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm font-semibold px-2 py-1 w-full"
          />
        ) : (
          <h3 
            className="font-semibold cursor-text hover:text-emerald-600 transition-colors"
            onDoubleClick={() => setIsEditing(true)}
            title="Dê um duplo clique para editar"
          >
            {stage.name}
          </h3>
        )}
        <Badge variant="secondary" className="pointer-events-none">{dealsCount}</Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={onAddDeal}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
