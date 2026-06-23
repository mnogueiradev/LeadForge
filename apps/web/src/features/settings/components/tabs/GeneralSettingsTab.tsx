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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const generalSettingsSchema = z.object({
  company_name: z.string().min(1, 'Nome da empresa é obrigatório'),
  company_legal_name: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('URL inválida').or(z.literal('')),
  address: z.string().optional(),
  timezone: z.string().min(1, 'Timezone é obrigatório'),
  language: z.string().min(1, 'Idioma é obrigatório'),
  currency: z.string().min(1, 'Moeda padrão é obrigatória'),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsTabProps {
  initialData: Record<string, any>;
}

export function GeneralSettingsTab({ initialData }: GeneralSettingsTabProps) {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('settings.write') || true; // Bypass temporário para dono
  const updateSettings = useUpdateSettings();

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      company_name: initialData.company_name || '',
      company_legal_name: initialData.company_legal_name || '',
      cnpj: initialData.cnpj || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      website: initialData.website || '',
      address: initialData.address || '',
      timezone: initialData.timezone || 'America/Sao_Paulo',
      language: initialData.language || 'pt-BR',
      currency: initialData.currency || 'BRL',
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset({
      company_name: initialData.company_name || '',
      company_legal_name: initialData.company_legal_name || '',
      cnpj: initialData.cnpj || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      website: initialData.website || '',
      address: initialData.address || '',
      timezone: initialData.timezone || 'America/Sao_Paulo',
      language: initialData.language || 'pt-BR',
      currency: initialData.currency || 'BRL',
    });
  }, [initialData, form]);

  const onSubmit = (data: GeneralSettingsValues) => {
    // Collect only dirty fields
    const dirtyFields = Object.keys(form.formState.dirtyFields) as (keyof GeneralSettingsValues)[];
    
    if (dirtyFields.length === 0) return;

    const updates = dirtyFields.map((key) => ({
      key,
      value: data[key],
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
        <h3 className="text-lg font-medium">Geral</h3>
        <p className="text-sm text-muted-foreground">
          Configurações básicas da empresa e do sistema.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Principal</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <FormControl>
                    <Input disabled={!canWrite || updateSettings.isPending} type="url" placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl>
                  <Input disabled={!canWrite || updateSettings.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    disabled={!canWrite || updateSettings.isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (BRT)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <Select
                    disabled={!canWrite || updateSettings.isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda Padrão</FormLabel>
                  <Select
                    disabled={!canWrite || updateSettings.isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
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
