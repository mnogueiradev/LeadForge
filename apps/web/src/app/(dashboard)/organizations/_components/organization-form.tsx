'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const organizationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z.string().optional(),
  status: z.enum(['PROSPECT', 'CUSTOMER', 'CHURN', 'ARCHIVED']),
  industry: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function OrganizationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      document: '',
      status: 'PROSPECT',
      industry: '',
      website: '',
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    setLoading(true);
    try {
      await api.post('/organizations', data);
      toast.success('Empresa cadastrada com sucesso!');
      router.push('/organizations');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome da Empresa *</FormLabel>
                <FormControl>
                  <Input placeholder="Tech Corp" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ / Documento</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                    <SelectItem value="CHURN">Cancelado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segmento / Indústria</FormLabel>
                <FormControl>
                  <Input placeholder="Tecnologia, Saúde, etc." disabled={loading} {...field} />
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
                  <Input placeholder="https://..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Salvando...' : 'Salvar Empresa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
