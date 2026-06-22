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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUpdatePipeline, Pipeline } from '../api/use-pipelines';

const editPipelineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(255, 'Descrição muito longa').optional(),
  isDefault: z.boolean(),
});

type EditPipelineValues = z.infer<typeof editPipelineSchema>;

interface EditPipelineModalProps {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPipelineModal({ pipeline, open, onOpenChange }: EditPipelineModalProps) {
  const { mutateAsync: updatePipeline, isPending } = useUpdatePipeline();

  const form = useForm<EditPipelineValues>({
    resolver: zodResolver(editPipelineSchema),
    defaultValues: {
      name: '',
      description: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (pipeline && open) {
      form.reset({
        name: pipeline.name,
        description: pipeline.description || '',
        isDefault: pipeline.isDefault,
      });
    }
  }, [pipeline, open, form]);

  const onSubmit = async (data: EditPipelineValues) => {
    if (!pipeline) return;
    try {
      await updatePipeline({ id: pipeline.id, payload: data });
      toast.success('Pipeline atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao atualizar pipeline.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pipeline</DialogTitle>
          <DialogDescription>
            Altere as informações deste funil de vendas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Pipeline *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Vendas B2B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Pipeline Padrão</FormLabel>
                    <FormDescription>
                      Novos negócios serão adicionados a este pipeline por padrão.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
