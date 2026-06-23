import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePermissions } from '@/hooks/usePermissions';
import { useUpdateSettings } from '../../api/use-settings';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImagePlus, Loader2 } from 'lucide-react';

const appearanceSettingsSchema = z.object({
  theme: z.string().min(1, 'Tema é obrigatório'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
  logo_url: z.string().optional(),
});

type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;

interface AppearanceSettingsTabProps {
  initialData: Record<string, any>;
}

export function AppearanceSettingsTab({ initialData }: AppearanceSettingsTabProps) {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('settings.write');
  const updateSettings = useUpdateSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      theme: initialData.theme || 'system',
      primary_color: initialData.primary_color || '#10b981', // LeadForge Green
      logo_url: initialData.logo_url || '',
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset({
      theme: initialData.theme || 'system',
      primary_color: initialData.primary_color || '#10b981',
      logo_url: initialData.logo_url || '',
    });
  }, [initialData, form]);

  const onSubmit = (data: AppearanceSettingsValues) => {
    const dirtyFields = Object.keys(form.formState.dirtyFields) as (keyof AppearanceSettingsValues)[];
    
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.post('/attachments/ORGANIZATION/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const attachmentUrl = res.data.url; 
      form.setValue('logo_url', attachmentUrl, { shouldDirty: true });
      toast.success('Logo carregado. Salve as alterações para persistir.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload do logo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const currentLogo = form.watch('logo_url');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Aparência</h3>
        <p className="text-sm text-muted-foreground">
          Personalize a identidade visual do seu CRM.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
          <FormField
            control={form.control}
            name="logo_url"
            render={() => (
              <FormItem>
                <FormLabel>Logo da Empresa</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                    {currentLogo ? (
                      <img src={currentLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canWrite || updateSettings.isPending || isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Alterar Logo'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Recomendado: 256x256px, formato PNG ou SVG com fundo transparente.
                    </p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoUpload}
                />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema Padrão</FormLabel>
                  <Select
                    disabled={!canWrite || updateSettings.isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema (Automático)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O tema padrão aplicado aos novos usuários.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor Principal</FormLabel>
                  <div className="flex items-center gap-3 mt-2">
                    <FormControl>
                      <div className="relative w-10 h-10 overflow-hidden rounded-full border shadow-sm flex-shrink-0 cursor-pointer">
                        <input
                          type="color"
                          disabled={!canWrite || updateSettings.isPending}
                          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {field.value.toUpperCase()}
                    </div>
                  </div>
                  <FormDescription>
                    Utilizada em botões principais e destaques no painel.
                  </FormDescription>
                  <FormMessage />
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
