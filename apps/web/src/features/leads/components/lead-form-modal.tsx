// @ts-nocheck
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useOrganizations } from '../../organizations/api/use-organizations';
import { useContacts } from '../../contacts/api/use-contacts';
import {
  useCreateLead,
  useUpdateLead,
  Lead,
} from '../api/use-leads';

const leadSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contactId: z.string().min(1, 'Contato é obrigatório').refine(val => val !== 'none', { message: 'Selecione um contato' }),
  organizationId: z.string().optional().or(z.literal('none')),
  description: z.string().optional(),
  source: z.enum(['MANUAL', 'WEB', 'IMPORT', 'REFERRAL']).optional(),
  temperature: z.enum(['COLD', 'WARM', 'HOT']).optional(),
  score: z.coerce.number().min(0).max(100).optional(),
  estimatedValue: z.coerce.number().min(0).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export function LeadFormModal({
  isOpen,
  onClose,
  lead,
}: LeadFormModalProps) {
  const isEditing = !!lead;
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const { data: organizationsResponse, isLoading: isLoadingOrgs } = useOrganizations({ limit: 100 });
  const organizations = organizationsResponse?.data || [];

  const { data: contactsResponse, isLoading: isLoadingContacts } = useContacts({ limit: 100 });
  const contacts = contactsResponse?.data || [];

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: '',
      contactId: 'none',
      organizationId: 'none',
      description: '',
      source: 'MANUAL',
      temperature: 'COLD',
      score: 0,
      estimatedValue: 0,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (lead) {
        form.reset({
          title: lead.title,
          contactId: lead.contactId,
          organizationId: lead.organizationId || 'none',
          description: lead.description || '',
          source: lead.source || 'MANUAL',
          temperature: lead.temperature || 'COLD',
          score: lead.score || 0,
          estimatedValue: lead.estimatedValue || 0,
        });
      } else {
        form.reset({
          title: '',
          contactId: 'none',
          organizationId: 'none',
          description: '',
          source: 'MANUAL',
          temperature: 'COLD',
          score: 0,
          estimatedValue: 0,
        });
      }
    }
  }, [isOpen, lead, form]);

  const onSubmit = async (values: LeadFormValues) => {
    try {
      const payload: any = { ...values };
      
      if (payload.organizationId === 'none' || payload.organizationId === '' || payload.organizationId === null) {
        delete payload.organizationId;
      }

      if (isEditing && lead) {
        await updateMutation.mutateAsync({
          id: lead.id,
          payload,
        });
        toast.success('Lead atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Lead criado com sucesso!');
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Ocorreu um erro ao salvar o lead. Tente novamente.'
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing ? 'Editar Lead' : 'Novo Lead'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da oportunidade abaixo.'
              : 'Preencha os dados para criar uma nova oportunidade no CRM.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          <Form {...form}>
            <form id="lead-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oportunidade (Título) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Licenças Enterprise 50 usuários" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato Principal *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingContacts}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um contato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" disabled>Selecione um contato</SelectItem>
                          {contacts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.firstName} {c.lastName || ''}
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
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa Vinculada</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingOrgs}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma (Sem vínculo)</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Previsto (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="COLD">Fria</SelectItem>
                          <SelectItem value="WARM">Média</SelectItem>
                          <SelectItem value="HOT">Quente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem do Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANUAL">Manual</SelectItem>
                          <SelectItem value="WEB">Site / Web</SelectItem>
                          <SelectItem value="REFERRAL">Indicação</SelectItem>
                          <SelectItem value="IMPORT">Importação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="border-t pt-4 mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Oportunidade</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes adicionais sobre o lead..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="p-6 pt-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="lead-form" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Lead'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
