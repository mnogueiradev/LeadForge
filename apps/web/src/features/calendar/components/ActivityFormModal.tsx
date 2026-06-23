import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

import { useOrganizations } from '@/features/organizations/api/use-organizations';
import { useContacts } from '@/features/contacts/api/use-contacts';
import { useUsers } from '@/features/users/api/use-users';
import {
  Activity,
  useCreateActivity,
  useUpdateActivity,
  useAssignActivity,
} from '@/features/activities/api/use-activities';

const activitySchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['call', 'meeting', 'email', 'task', 'whatsapp', 'follow_up'], {
    required_error: 'O tipo é obrigatório',
  }),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  date: z.string().min(1, 'A data é obrigatória'),
  time: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
  location: z.string().optional(),
  ownerUserId: z.string().min(1, 'O responsável é obrigatório'),
  organizationId: z.string().optional(),
  contactId: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  activity?: Activity | null;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // HH:mm
}

export function ActivityFormModal({
  isOpen,
  onClose,
  mode,
  activity,
  initialDate,
  initialTime,
}: ActivityFormModalProps) {
  const isEdit = mode === 'edit';

  const { data: usersData } = useUsers();
  const users = Array.isArray(usersData) ? usersData : usersData?.data ?? [];

  const { data: orgsData } = useOrganizations({ limit: 100 });
  const organizations = Array.isArray(orgsData) ? orgsData : orgsData?.data ?? [];

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const assignActivity = useAssignActivity();

  // default values Setup
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'meeting',
      priority: 'medium',
      date: initialDate || format(new Date(), 'yyyy-MM-dd'),
      time: initialTime || '',
      durationMinutes: 60,
      location: '',
      ownerUserId: '',
      organizationId: '',
      contactId: '',
    },
  });

  const selectedOrgId = form.watch('organizationId');
  
  // Refetch contacts when org changes
  const { data: contactsData } = useContacts({ 
    organizationId: selectedOrgId && selectedOrgId !== 'none' ? selectedOrgId : undefined,
  });
  const contacts = Array.isArray(contactsData) ? contactsData : contactsData?.data ?? [];

  // Reset or initialize form
  React.useEffect(() => {
    if (isOpen) {
      if (isEdit && activity) {
        const dueDate = new Date(activity.dueDate);
        form.reset({
          title: activity.title,
          description: activity.description || '',
          type: activity.type,
          priority: activity.priority,
          date: format(dueDate, 'yyyy-MM-dd'),
          time: format(dueDate, 'HH:mm'),
          durationMinutes: activity.durationMinutes || 60,
          location: activity.location || '',
          ownerUserId: activity.ownerUserId || form.getValues('ownerUserId') || '',
          organizationId: activity.organizationId || 'none',
          contactId: activity.contactId || 'none',
        });
      } else {
        form.reset({
          title: '',
          description: '',
          type: 'meeting',
          priority: 'medium',
          date: initialDate || format(new Date(), 'yyyy-MM-dd'),
          time: initialTime || '',
          durationMinutes: 60,
          location: '',
          ownerUserId: form.getValues('ownerUserId') || '',
          organizationId: 'none',
          contactId: 'none',
        });
      }
    }
  }, [isOpen, isEdit, activity?.id, initialDate, initialTime]); 

  // Se users carregar e não houver ownerUserId, define o primeiro
  React.useEffect(() => {
    if (isOpen && users.length > 0 && !form.getValues('ownerUserId')) {
      form.setValue('ownerUserId', users[0].id, { shouldValidate: true });
    }
  }, [isOpen, users, form]);

  // Se a empresa mudar, limpa o contato selecionado
  React.useEffect(() => {
    if (isOpen && !isEdit) {
      form.setValue('contactId', 'none');
    }
  }, [selectedOrgId]);

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      const dueDateTime = values.time 
        ? new Date(`${values.date}T${values.time}:00`)
        : new Date(`${values.date}T12:00:00`);

      if (!isEdit && dueDateTime < new Date()) {
        form.setError('date', { type: 'manual', message: 'A data deve ser futura para novas atividades.' });
        return;
      }

      const dueDateTimeISO = dueDateTime.toISOString();

      if (isEdit && activity) {
        await updateActivity.mutateAsync({
          id: activity.id,
          data: {
            title: values.title,
            description: values.description,
            type: values.type,
            priority: values.priority,
            dueDate: dueDateTimeISO,
            durationMinutes: values.durationMinutes,
            location: values.location,
          },
        });

        if (values.ownerUserId && values.ownerUserId !== activity.ownerUserId) {
          await assignActivity.mutateAsync({ id: activity.id, ownerUserId: values.ownerUserId });
        }

        toast.success('Atividade atualizada com sucesso');
      } else {
        await createActivity.mutateAsync({
          title: values.title,
          description: values.description,
          type: values.type,
          priority: values.priority,
          dueDate: dueDateTimeISO,
          durationMinutes: values.durationMinutes,
          location: values.location,
          ownerUserId: values.ownerUserId,
          organizationId: values.organizationId === 'none' ? undefined : values.organizationId,
          contactId: values.contactId === 'none' ? undefined : values.contactId,
        });

        toast.success('Atividade criada com sucesso');
      }
      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar atividade:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Erro ao processar a requisição.';
      toast.error(isEdit ? `Erro ao atualizar atividade: ${errorMessage}` : `Erro ao criar atividade: ${errorMessage}`);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Por favor, preencha todos os campos obrigatórios.");
  };

  const isPending = createActivity.isPending || updateActivity.isPending || assignActivity.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Faça alterações nos detalhes da atividade.' : 'Preencha os dados para agendar uma nova atividade.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reunião de Apresentação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">Ligação</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="task">Tarefa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ownerUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md border">
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {organizations.map((org: any) => (
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
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato (Opcional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedOrgId || selectedOrgId === 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o contato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {contacts.map((contact: any) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Selecione a empresa primeiro.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes adicionais sobre a atividade..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar Atividade'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
