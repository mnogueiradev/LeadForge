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
import {
  useCreateContact,
  useUpdateContact,
  Contact,
} from '../api/use-contacts';

const contactSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().optional(),
  primaryEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  organizationId: z.string().optional().or(z.literal('none')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  source: z.enum(['MANUAL', 'WEB', 'IMPORT', 'REFERRAL']),
  description: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

export function ContactFormModal({
  isOpen,
  onClose,
  contact,
}: ContactFormModalProps) {
  const isEditing = !!contact;
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const { data: organizationsResponse, isLoading: isLoadingOrgs } = useOrganizations({ limit: 100 });
  const organizations = organizationsResponse?.data || [];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      primaryEmail: '',
      primaryPhone: '',
      jobTitle: '',
      department: '',
      organizationId: 'none',
      status: 'ACTIVE',
      source: 'MANUAL',
      description: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (contact) {
        form.reset({
          firstName: contact.firstName,
          lastName: contact.lastName || '',
          primaryEmail: contact.primaryEmail || '',
          primaryPhone: contact.primaryPhone || '',
          jobTitle: contact.jobTitle || '',
          department: contact.department || '',
          organizationId: contact.organizationId || 'none',
          status: contact.status,
          source: contact.source,
          description: contact.description || '',
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          primaryEmail: '',
          primaryPhone: '',
          jobTitle: '',
          department: '',
          organizationId: 'none',
          status: 'ACTIVE',
          source: 'MANUAL',
          description: '',
        });
      }
    }
  }, [isOpen, contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const payload: any = { ...values };
      
      if (payload.primaryEmail === '') delete payload.primaryEmail;
      if (payload.organizationId === 'none' || payload.organizationId === '' || payload.organizationId === null) {
        delete payload.organizationId;
      }

      if (isEditing && contact) {
        await updateMutation.mutateAsync({
          id: contact.id,
          payload,
        });
        toast.success('Contato atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Contato criado com sucesso!');
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Ocorreu um erro ao salvar o contato. Tente novamente.'
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do contato abaixo.'
              : 'Preencha os dados para criar um novo contato no CRM.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          <Form {...form}>
            <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="João" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Souza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Principal</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Gerente de Vendas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Comercial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes adicionais sobre o contato..."
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
          <Button type="submit" form="contact-form" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Contato'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
