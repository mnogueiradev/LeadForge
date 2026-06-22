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
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useCreateOrganization,
  useUpdateOrganization,
  Organization,
} from '../api/use-organizations';

const organizationSchema = z.object({
  name: z.string().min(1, 'Nome da Empresa é obrigatório'),
  legalName: z.string().optional(),
  document: z.string().optional(), // Could add CNPJ validation
  website: z.string().url('Insira uma URL válida começando com http:// ou https://').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PROSPECT', 'CUSTOMER', 'PARTNER', 'SUPPLIER', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().optional(),
    complement: z.string().optional(),
    district: z.string().optional(),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zipCode: z.string().optional(),
    country: z.string().min(1, 'País é obrigatório'),
  }).optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
}

export function OrganizationFormModal({
  isOpen,
  onClose,
  organization,
}: OrganizationFormModalProps) {
  const isEditing = !!organization;
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      legalName: '',
      document: '',
      website: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      description: '',
      status: 'PROSPECT',
      address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
      },
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (organization) {
        // Pre-fill form
        const address = organization.addresses && organization.addresses.length > 0 ? organization.addresses[0] : null;
        
        form.reset({
          name: organization.name,
          legalName: organization.legalName || '',
          document: organization.document || '',
          website: organization.website || '',
          email: organization.email || '',
          phone: organization.phone || '',
          industry: organization.industry || '',
          companySize: organization.companySize || '',
          description: organization.description || '',
          status: organization.status,
          address: address ? {
            street: address.street,
            number: address.number || '',
            complement: address.complement || '',
            district: (address as any).neighborhood || address.district || '',
            city: address.city,
            state: address.state,
            zipCode: (address as any).postalCode || address.zipCode || '',
            country: address.country,
          } : undefined,
        });
      } else {
        form.reset({
          name: '',
          legalName: '',
          document: '',
          website: '',
          email: '',
          phone: '',
          industry: '',
          companySize: '',
          description: '',
          status: 'PROSPECT',
          address: {
            street: '',
            number: '',
            complement: '',
            district: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil',
          },
        });
      }
    }
  }, [isOpen, organization, form]);

  const onSubmit = async (values: OrganizationFormValues) => {
    try {
      // Clean up empty optional fields
      const payload: any = { ...values };
      if (payload.website === '') delete payload.website;
      if (payload.email === '') delete payload.email;
      
      // se não preencheu rua, removemos o endereço para não falhar
      if (payload.address && !payload.address.street) {
        delete payload.address;
      }

      if (isEditing && organization) {
        await updateMutation.mutateAsync({
          id: organization.id,
          payload,
        });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Empresa criada com sucesso!');
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Ocorreu um erro ao salvar a empresa. Tente novamente.'
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da empresa abaixo.'
              : 'Preencha os dados para criar uma nova empresa no CRM.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          <Form {...form}>
            <form id="organization-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation LTDA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
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
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LEAD">Lead</SelectItem>
                          <SelectItem value="PROSPECT">Prospecção</SelectItem>
                          <SelectItem value="CUSTOMER">Cliente</SelectItem>
                          <SelectItem value="PARTNER">Parceiro</SelectItem>
                          <SelectItem value="SUPPLIER">Fornecedor</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
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
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento</FormLabel>
                      <FormControl>
                        <Input placeholder="Tecnologia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MICRO">Micro (1-9)</SelectItem>
                          <SelectItem value="SMALL">Pequena (10-49)</SelectItem>
                          <SelectItem value="MEDIUM">Média (50-249)</SelectItem>
                          <SelectItem value="LARGE">Grande (250-999)</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Corporativo</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@empresa.com" {...field} />
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
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border-t pt-4 mt-6">
                <h3 className="font-medium">Endereço Principal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua/Avenida</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Paulista" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Sala 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bela Vista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
                          placeholder="Detalhes adicionais sobre a empresa..."
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
          <Button type="submit" form="organization-form" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Empresa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
