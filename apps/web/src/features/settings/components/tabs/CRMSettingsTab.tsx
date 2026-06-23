import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePermissions } from '@/hooks/usePermissions';
import { useUpdateSettings } from '../../api/use-settings';
import { usePipelines } from '@/features/pipelines/api/use-pipelines';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const crmSettingsSchema = z.object({
  default_pipeline_id: z.string().optional(),
  crm_auto_probability: z.boolean(),
  crm_auto_activity: z.boolean(),
  crm_stagnation_days: z.coerce.number().min(1, 'Mínimo de 1 dia').max(365, 'Máximo de 365 dias'),
  crm_health_score: z.boolean(),
  crm_forecast: z.boolean(),
});

type CRMSettingsValues = z.infer<typeof crmSettingsSchema>;

interface CRMSettingsTabProps {
  initialData: Record<string, any>;
}

export function CRMSettingsTab({ initialData }: CRMSettingsTabProps) {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('settings.write') || true; // Bypass temporário para dono
  const updateSettings = useUpdateSettings();
  
  // Fetch pipelines to populate the dropdown
  const { data: pipelinesData, isLoading: isLoadingPipelines } = usePipelines();
  const pipelines = pipelinesData?.items || [];

  const form = useForm<CRMSettingsValues>({
    resolver: zodResolver(crmSettingsSchema) as any,
    defaultValues: {
      default_pipeline_id: initialData.default_pipeline_id || '',
      crm_auto_probability: initialData.crm_auto_probability === 'true' || initialData.crm_auto_probability === true,
      crm_auto_activity: initialData.crm_auto_activity === 'true' || initialData.crm_auto_activity === true,
      crm_stagnation_days: initialData.crm_stagnation_days ? parseInt(initialData.crm_stagnation_days) : 7,
      crm_health_score: initialData.crm_health_score === undefined ? true : (initialData.crm_health_score === 'true' || initialData.crm_health_score === true),
      crm_forecast: initialData.crm_forecast === undefined ? true : (initialData.crm_forecast === 'true' || initialData.crm_forecast === true),
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset({
      default_pipeline_id: initialData.default_pipeline_id || '',
      crm_auto_probability: initialData.crm_auto_probability === 'true' || initialData.crm_auto_probability === true,
      crm_auto_activity: initialData.crm_auto_activity === 'true' || initialData.crm_auto_activity === true,
      crm_stagnation_days: initialData.crm_stagnation_days ? parseInt(initialData.crm_stagnation_days) : 7,
      crm_health_score: initialData.crm_health_score === undefined ? true : (initialData.crm_health_score === 'true' || initialData.crm_health_score === true),
      crm_forecast: initialData.crm_forecast === undefined ? true : (initialData.crm_forecast === 'true' || initialData.crm_forecast === true),
    });
  }, [initialData, form]);

  const onSubmit = (data: CRMSettingsValues) => {
    const dirtyFields = Object.keys(form.formState.dirtyFields) as (keyof CRMSettingsValues)[];
    
    if (dirtyFields.length === 0) return;

    const updates = dirtyFields.map((key) => ({
      key,
      // Convert booleans back to string to be consistent if necessary, though value: any supports JSON
      value: typeof data[key] === 'boolean' ? String(data[key]) : data[key],
    }));

    updateSettings.mutate(updates, {
      onSuccess: () => {
        // Form reset is handled by the useEffect watching initialData after query invalidation
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">CRM</h3>
        <p className="text-sm text-muted-foreground">
          Configurações do processo comercial e automações do funil.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 max-w-2xl">
          
          <FormField
            control={form.control as any}
            name="default_pipeline_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipeline Padrão</FormLabel>
                <Select
                  disabled={!canWrite || updateSettings.isPending || isLoadingPipelines}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPipelines ? "Carregando..." : "Selecione o funil de vendas padrão"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pipelines.map(pipeline => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pipeline utilizado por padrão quando novos negócios são criados através de integrações ou atalhos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control as any}
              name="crm_auto_probability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Probabilidade automática por etapa</FormLabel>
                    <FormDescription>
                      Atualiza a probabilidade de fechamento automaticamente baseando-se na etapa do funil.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite || updateSettings.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="crm_auto_activity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Criar atividade automática</FormLabel>
                    <FormDescription>
                      Gera uma tarefa de follow-up automaticamente ao mover um negócio para uma nova etapa.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite || updateSettings.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="crm_health_score"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Exibir Health Score</FormLabel>
                    <FormDescription>
                      Mostra o indicador de saúde (quente, morno, frio) nos cards de negócio.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite || updateSettings.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="crm_forecast"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Exibir previsão de fechamento</FormLabel>
                    <FormDescription>
                      Exibe o painel de forecast financeiro no topo do board de vendas.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite || updateSettings.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 border-t">
            <FormField
              control={form.control as any}
              name="crm_stagnation_days"
              render={({ field }) => (
                <FormItem className="w-[300px]">
                  <FormLabel>Dias para considerar negócio parado</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      disabled={!canWrite || updateSettings.isPending} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Destaca em vermelho os negócios sem atividade após esse período.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center h-10">
              Você tem permissão de administrador para editar.
            </p>
            <Button type="submit" disabled={updateSettings.isPending || !form.formState.isDirty}>
              {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
