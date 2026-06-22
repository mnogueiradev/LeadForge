import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDeal } from '../api/use-deals';
import { usePipelines, usePipelineStages } from '../../pipelines/api/use-pipelines';
import { useOrganizations } from '../../organizations/api/use-organizations';
import { useContacts } from '../../contacts/api/use-contacts';
import { useUsers } from '../../users/api/use-users';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const createDealSchema = z.object({
  pipelineId: z.string().min(1, 'O pipeline é obrigatório'),
  title: z.string().min(1, 'O título é obrigatório'),
  value: z.string().optional(),
  probability: z.string().optional(),
  stageId: z.string().min(1, 'A etapa é obrigatória'),
  organizationId: z.string().optional(),
  contactId: z.string().optional(),
  ownerUserId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
});

type CreateDealValues = z.infer<typeof createDealSchema>;

interface CreateDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId?: string; // Tornando opcional, pois o modal pode selecionar
  defaultStageId?: string;
}

class DealModalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CreateDealModal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Interface</AlertTitle>
          <AlertDescription>
            Ocorreu um erro inesperado ao carregar os dados deste formulário. Por favor, feche e tente novamente.
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export function CreateDealModal({ open, onOpenChange, pipelineId: initialPipelineId, defaultStageId }: CreateDealModalProps) {
  const createDealMutation = useCreateDeal();
  
  // Queries
  const { data: pipelinesData, isLoading: isLoadingPipelines } = usePipelines();
  const pipelines = Array.isArray(pipelinesData?.items) ? pipelinesData.items : [];
  
  React.useEffect(() => {
    if (pipelines.length > 0) {
      console.log('DEBUG: Pipelines carregados', pipelines);
    }
  }, [pipelinesData?.items]);
  
  const { data: orgsData } = useOrganizations({ limit: 100 });
  const { data: usersData } = useUsers();

  const orgs = Array.isArray(orgsData?.data) ? orgsData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : (Array.isArray(usersData) ? usersData : []);

  React.useEffect(() => {
    console.log('DEBUG: orgsData', orgsData);
    console.log('DEBUG: usersData', usersData);
  }, [orgsData, usersData]);

  const form = useForm<CreateDealValues>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      pipelineId: initialPipelineId || '',
      title: '',
      value: '',
      probability: '50',
      stageId: defaultStageId || '',
      organizationId: '',
      contactId: '',
      ownerUserId: '',
      expectedCloseDate: '',
      description: '',
    },
  });

  console.log("render CreateDealModal");
  console.log("pipelinesData", pipelinesData);
  const selectedPipelineId = useWatch({
    control: form.control,
    name: 'pipelineId',
  });

  console.log("selectedPipeline", selectedPipelineId);

  // Carregar os estágios apenas se tivermos um pipeline selecionado
  const { data: stages, isLoading: isLoadingStages } = usePipelineStages(selectedPipelineId, { 
    enabled: !!selectedPipelineId 
  });
  
  console.log("stagesData", stages);

  React.useEffect(() => {
    if (selectedPipelineId && stages) {
      console.log(`DEBUG: Estágios carregados para o pipeline ${selectedPipelineId}:`, stages);
    }
  }, [selectedPipelineId, stages]);

  const selectedOrgId = useWatch({
    control: form.control,
    name: 'organizationId',
  });

  const { data: contactsData } = useContacts({ organizationId: selectedOrgId || undefined });
  const contacts = Array.isArray(contactsData?.data) ? contactsData.data : [];
  const safeStages = Array.isArray(stages) ? stages : [];

  React.useEffect(() => {
    console.log('DEBUG: contactsData', contactsData);
  }, [contactsData]);

  // Auto-selecionar pipeline se houver apenas 1
  const pipelineLength = pipelines.length;
  React.useEffect(() => {
    if (open && !selectedPipelineId) {
      if (initialPipelineId) {
        form.setValue('pipelineId', initialPipelineId);
      } else if (pipelineLength === 1) {
        form.setValue('pipelineId', pipelines[0].id);
      }
    }
  }, [open, pipelineLength, selectedPipelineId, initialPipelineId, form]);

  // Reset do form ao abrir
  React.useEffect(() => {
    if (open) {
      form.reset({
        pipelineId: initialPipelineId || (pipelines.length === 1 ? pipelines[0].id : ''),
        title: '',
        value: '',
        probability: '50',
        stageId: defaultStageId || '',
        organizationId: '',
        contactId: '',
        ownerUserId: '',
        expectedCloseDate: '',
        description: '',
      });
    }
  }, [open, initialPipelineId, defaultStageId, form]);

  // Auto-selecionar primeira etapa se houver estágios, caso stageId esteja vazio
  const currentStageId = useWatch({ control: form.control, name: 'stageId' });
  const stagesLength = safeStages.length;
  
  React.useEffect(() => {
    if (open && stagesLength > 0) {
      const formStageId = form.getValues('stageId');
      const isValidStage = safeStages.some(s => s.id === formStageId);
      
      if (!formStageId || !isValidStage) {
        form.setValue('stageId', safeStages[0].id);
      }
    } else if (open && stagesLength === 0 && !isLoadingStages) {
      form.setValue('stageId', '');
    }
  }, [stagesLength, safeStages, open, isLoadingStages, form]);

  // Reset contact when organization changes
  React.useEffect(() => {
    form.setValue('contactId', '');
  }, [selectedOrgId, form]);

  const onSubmit = async (values: CreateDealValues) => {
    try {
      console.log('Enviando payload para criar deal:', values);
      await createDealMutation.mutateAsync({
        title: values.title,
        value: values.value ? parseFloat(values.value) : 0,
        probability: values.probability ? parseInt(values.probability, 10) : 0,
        stageId: values.stageId,
        pipelineId: values.pipelineId,
        organizationId: values.organizationId === 'none' ? undefined : (values.organizationId || undefined),
        contactId: values.contactId === 'none' ? undefined : (values.contactId || undefined),
        ownerUserId: values.ownerUserId === 'none' ? undefined : (values.ownerUserId || undefined),
        expectedCloseDate: values.expectedCloseDate || undefined,
        description: values.description || undefined,
        currency: 'BRL',
      });
      console.log('Deal criado com sucesso!');
      toast.success('Negócio criado com sucesso!');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao criar deal:', error);
      toast.error(error?.response?.data?.message || 'Erro ao criar negócio.');
    }
  };

  const hasNoStages = selectedPipelineId && safeStages.length === 0 && !isLoadingStages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Negócio</DialogTitle>
          <DialogDescription>Adicione um novo negócio ao seu funil de vendas.</DialogDescription>
        </DialogHeader>

        <DealModalErrorBoundary>
          {hasNoStages && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pipeline sem etapas configuradas</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3">
              <span>Para criar um negócio, este pipeline precisa ter pelo menos uma etapa cadastrada.</span>
              <Button asChild variant="outline" size="sm" className="w-fit border-destructive/30 hover:bg-destructive/10 text-destructive-foreground">
                <Link to={`/pipelines/${selectedPipelineId}`} onClick={() => onOpenChange(false)}>
                  Configurar etapas do Pipeline <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pipelineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pipeline *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoadingPipelines}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPipelines ? "Carregando..." : "Selecione um pipeline"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id}>
                            {pipeline.name}
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
                name="stageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa do Funil *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedPipelineId || isLoadingStages || hasNoStages}>
                      <FormControl>
                        <SelectTrigger>
                          {isLoadingStages ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Carregando...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder={hasNoStages ? "Nenhuma etapa encontrada" : "Selecione uma etapa"} />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {safeStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Negócio *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Licenças Enterprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probabilidade (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vincular empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {orgs.map((org: any) => (
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
                    <FormLabel>Contato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedOrgId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedOrgId ? "Selecione a empresa primeiro" : "Vincular contato"} />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Atribuir a..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">(Você)</SelectItem>
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

              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Fechamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes do negócio, necessidades, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createDealMutation.isPending || hasNoStages}>
                {createDealMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Negócio
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </DealModalErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
