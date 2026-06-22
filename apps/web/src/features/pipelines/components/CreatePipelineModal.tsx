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
import { useCreatePipeline } from '../api/use-pipelines';

const createPipelineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(255, 'Descrição muito longa').optional(),
  isDefault: z.boolean(),
});

type CreatePipelineValues = z.infer<typeof createPipelineSchema>;

interface CreatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePipelineModal({ open, onOpenChange }: CreatePipelineModalProps) {
  const { mutateAsync: createPipeline, isPending } = useCreatePipeline();

  const form = useForm<CreatePipelineValues>({
    resolver: zodResolver(createPipelineSchema),
    defaultValues: {
      name: '',
      description: '',
      isDefault: false,
    },
  });

  const onSubmit = async (data: CreatePipelineValues) => {
    try {
      await createPipeline(data);
      toast.success('Pipeline criado com sucesso!');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar pipeline.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Pipeline</DialogTitle>
          <DialogDescription>
            Crie um novo funil de vendas para gerenciar seus negócios.
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Criar Pipeline'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
