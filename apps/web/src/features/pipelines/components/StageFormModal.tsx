import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useCreatePipelineStage, useUpdatePipelineStage, PipelineStage } from '../api/use-pipelines';

const stageFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  probability: z.number().min(0).max(100),
  color: z.string().optional().nullable(),
});

type StageFormValues = z.infer<typeof stageFormSchema>;

interface StageFormModalProps {
  pipelineId: string;
  stageToEdit: PipelineStage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROBABILITIES = [0, 10, 25, 50, 75, 100];

export function StageFormModal({ pipelineId, stageToEdit, open, onOpenChange }: StageFormModalProps) {
  const { mutateAsync: createStage, isPending: isCreating } = useCreatePipelineStage();
  const { mutateAsync: updateStage, isPending: isUpdating } = useUpdatePipelineStage();

  const isPending = isCreating || isUpdating;

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      name: '',
      probability: 0,
      color: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (stageToEdit) {
        form.reset({
          name: stageToEdit.name,
          probability: stageToEdit.probability,
          color: stageToEdit.color || '',
        });
      } else {
        form.reset({
          name: '',
          probability: 0,
          color: '',
        });
      }
    }
  }, [stageToEdit, open, form]);

  const onSubmit = async (data: StageFormValues) => {
    try {
      if (stageToEdit) {
        await updateStage({ pipelineId, stageId: stageToEdit.id, payload: data });
        toast.success('Estágio atualizado com sucesso!');
      } else {
        // Defaults displayOrder to 0, backend will probably append or handle
        // Wait, the API allows omitting displayOrder or we can just send it. Let's send a default or omit it.
        await createStage({ pipelineId, payload: { ...data, displayOrder: 999 } });
        toast.success('Estágio criado com sucesso!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar estágio.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{stageToEdit ? 'Editar Estágio' : 'Novo Estágio'}</DialogTitle>
          <DialogDescription>
            {stageToEdit ? 'Altere as propriedades deste estágio do funil.' : 'Adicione uma nova etapa ao seu funil de vendas.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Estágio *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Qualificação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="probability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Probabilidade (%)</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a probabilidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROBABILITIES.map((prob) => (
                        <SelectItem key={prob} value={prob.toString()}>
                          {prob}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="color" className="h-10 w-full cursor-pointer" {...field} value={field.value || '#e2e8f0'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
