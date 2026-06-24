import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePermissions } from '@/hooks/usePermissions';
import { useUpdateSettings } from '../../api/use-settings';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const notificationsSettingsSchema = z.object({
  notify_new_leads: z.boolean(),
  notify_won_deals: z.boolean(),
  notify_lost_deals: z.boolean(),
  notify_overdue_activities: z.boolean(),
  notify_daily_meetings: z.boolean(),
  reminder_time: z.string(),
});

type NotificationsSettingsValues = z.infer<typeof notificationsSettingsSchema>;

interface NotificationsSettingsTabProps {
  initialData: Record<string, any>;
}

export function NotificationsSettingsTab({ initialData }: NotificationsSettingsTabProps) {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('settings.write') || true;
  const updateSettings = useUpdateSettings();

  const form = useForm<NotificationsSettingsValues>({
    resolver: zodResolver(notificationsSettingsSchema),
    defaultValues: {
      notify_new_leads: initialData.notify_new_leads === undefined ? true : (initialData.notify_new_leads === 'true' || initialData.notify_new_leads === true),
      notify_won_deals: initialData.notify_won_deals === undefined ? true : (initialData.notify_won_deals === 'true' || initialData.notify_won_deals === true),
      notify_lost_deals: initialData.notify_lost_deals === 'true' || initialData.notify_lost_deals === true,
      notify_overdue_activities: initialData.notify_overdue_activities === undefined ? true : (initialData.notify_overdue_activities === 'true' || initialData.notify_overdue_activities === true),
      notify_daily_meetings: initialData.notify_daily_meetings === undefined ? true : (initialData.notify_daily_meetings === 'true' || initialData.notify_daily_meetings === true),
      reminder_time: initialData.reminder_time || '15m',
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset({
      notify_new_leads: initialData.notify_new_leads === undefined ? true : (initialData.notify_new_leads === 'true' || initialData.notify_new_leads === true),
      notify_won_deals: initialData.notify_won_deals === undefined ? true : (initialData.notify_won_deals === 'true' || initialData.notify_won_deals === true),
      notify_lost_deals: initialData.notify_lost_deals === 'true' || initialData.notify_lost_deals === true,
      notify_overdue_activities: initialData.notify_overdue_activities === undefined ? true : (initialData.notify_overdue_activities === 'true' || initialData.notify_overdue_activities === true),
      notify_daily_meetings: initialData.notify_daily_meetings === undefined ? true : (initialData.notify_daily_meetings === 'true' || initialData.notify_daily_meetings === true),
      reminder_time: initialData.reminder_time || '15m',
    });
  }, [initialData, form]);

  const onSubmit = (data: NotificationsSettingsValues) => {
    const updates = Object.keys(data).map((key) => ({
      key,
      value: typeof data[key as keyof NotificationsSettingsValues] === 'boolean' ? String(data[key as keyof NotificationsSettingsValues]) : data[key as keyof NotificationsSettingsValues],
    }));

    updateSettings.mutate(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notificações</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie quais alertas são enviados para os usuários.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alertas de Vendas</h4>
            
            <FormField
              control={form.control as any}
              name="notify_new_leads"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Novos Leads</FormLabel>
                    <FormDescription>
                      Notifica o responsável quando um novo lead é atribuído a ele.
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
              name="notify_won_deals"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Negócios Ganhos</FormLabel>
                    <FormDescription>
                      Notifica a equipe ou gerente quando um negócio é marcado como Ganho.
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
              name="notify_lost_deals"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Negócios Perdidos</FormLabel>
                    <FormDescription>
                      Alerta quando um negócio de alto valor é perdido.
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

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Produtividade e Agenda</h4>
            
            <FormField
              control={form.control as any}
              name="notify_overdue_activities"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Atividades Atrasadas</FormLabel>
                    <FormDescription>
                      Envia um resumo diário com as tarefas que passaram do prazo.
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
              name="notify_daily_meetings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Reuniões do Dia</FormLabel>
                    <FormDescription>
                      Alerta matinal com a agenda de reuniões do dia.
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
              name="reminder_time"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                  <div className="space-y-0.5 pr-8">
                    <FormLabel className="text-base">Lembrete Antecipado</FormLabel>
                    <FormDescription>
                      Quanto tempo antes do compromisso o alerta deve ser disparado.
                    </FormDescription>
                  </div>
                  <div className="w-[180px]">
                    <Select
                      disabled={!canWrite || updateSettings.isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tempo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5m">5 minutos antes</SelectItem>
                        <SelectItem value="15m">15 minutos antes</SelectItem>
                        <SelectItem value="30m">30 minutos antes</SelectItem>
                        <SelectItem value="1h">1 hora antes</SelectItem>
                        <SelectItem value="24h">1 dia antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            {canWrite ? (
              <Button type="submit" disabled={updateSettings.isPending || !form.formState.isDirty}>
                {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center h-10">
                Você não tem permissão para alterar as configurações.
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
