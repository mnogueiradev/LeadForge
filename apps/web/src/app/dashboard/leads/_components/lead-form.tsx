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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const leadSchema = z.object({
  title: z.string().min(2, 'O título deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  status: z.enum(['NEW', 'QUALIFYING', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST', 'DISQUALIFIED']),
  temperature: z.enum(['HOT', 'WARM', 'COLD']),
  estimatedValue: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function LeadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'NEW',
      temperature: 'WARM',
      estimatedValue: '',
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);
    try {
      // Note: The API expects the numbers as a Decimal. We convert string to float if present.
      const payload = {
        ...data,
        estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
      };
      await api.post('/leads', payload);
      toast.success('Lead cadastrado com sucesso!');
      router.push('/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar lead.');
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
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Título da Oportunidade *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Projeto CRM 2024" disabled={loading} {...field} />
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
                <FormLabel>Fase / Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NEW">Novo Lead</SelectItem>
                    <SelectItem value="QUALIFYING">Qualificação</SelectItem>
                    <SelectItem value="MEETING_SCHEDULED">Reunião Agendada</SelectItem>
                    <SelectItem value="PROPOSAL_SENT">Proposta Enviada</SelectItem>
                    <SelectItem value="CONVERTED">Convertido (Ganho)</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                    <SelectItem value="DISQUALIFIED">Desqualificado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperatura *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a temperatura" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HOT">Quente (Hot)</SelectItem>
                    <SelectItem value="WARM">Morno (Warm)</SelectItem>
                    <SelectItem value="COLD">Frio (Cold)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Estimado (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="10000.00" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalhes adicionais sobre a oportunidade..." disabled={loading} {...field} />
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
            {loading ? 'Salvando...' : 'Salvar Lead'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
