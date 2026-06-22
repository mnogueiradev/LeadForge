import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react';

import { Pipeline } from '../api/use-pipelines';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PipelineCardProps {
  pipeline: Pipeline;
  onEdit: (pipeline: Pipeline) => void;
  onArchive: (pipeline: Pipeline) => void;
  onDelete: (pipeline: Pipeline) => void;
}

export function PipelineCard({ pipeline, onEdit, onArchive, onDelete }: PipelineCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <Link to={`/pipelines/${pipeline.id}`} className="hover:underline">
            <CardTitle className="text-xl text-emerald-600 dark:text-emerald-400">
              {pipeline.name}
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(pipeline)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onArchive(pipeline)}
                className="text-red-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(pipeline)}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {pipeline.description && (
          <CardDescription>{pipeline.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={pipeline.isActive ? "default" : "secondary"}>
              {pipeline.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          {pipeline.isDefault && (
            <div className="flex justify-between">
              <span>Pipeline Padrão:</span>
              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                Sim
              </Badge>
            </div>
          )}
          {pipeline.createdAt && (
            <div className="flex justify-between">
              <span>Criado em:</span>
              <span>{format(new Date(pipeline.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Link to={`/pipelines/${pipeline.id}`}>
            <Button variant="secondary" className="w-full">
              Gerenciar Estágios
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
