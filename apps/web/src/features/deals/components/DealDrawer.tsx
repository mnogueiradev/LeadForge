import * as React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Deal, useDeal, useUpdateDeal } from '../api/use-deals';
import { useUsers } from '../../users/api/use-users';
import { useOrganizations } from '../../organizations/api/use-organizations';
import { useContacts } from '../../contacts/api/use-contacts';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { DealTimeline } from './DealTimeline';

interface DealDrawerProps {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDrawer({ dealId, open, onOpenChange }: DealDrawerProps) {
  const { data: deal, isLoading } = useDeal(dealId || undefined);
  const updateDealMutation = useUpdateDeal();
  
  const { data: usersResponse } = useUsers();
  const { data: orgsResponse } = useOrganizations();
  const { data: contactsResponse } = useContacts({ organizationId: deal?.organizationId || undefined });

  const [formData, setFormData] = React.useState<Partial<Deal>>({});

  React.useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        description: deal.description || '',
        value: deal.value || 0,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
        ownerUserId: deal.ownerUserId,
        organizationId: deal.organizationId,
        contactId: deal.contactId,
      });
    }
  }, [deal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!dealId) return;
    updateDealMutation.mutate({
      id: dealId,
      ...formData,
      value: formData.value ? Number(formData.value) : undefined,
      probability: formData.probability ? Number(formData.probability) : undefined,
    });
  };

  if (!dealId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isLoading ? 'Carregando...' : deal?.title}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div>Carregando os detalhes do negócio...</div>
        ) : (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6 mt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Negócio</Label>
                  <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input id="value" name="value" type="number" value={formData.value || ''} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidade (%)</Label>
                    <Input id="probability" name="probability" type="number" min="0" max="100" value={formData.probability || ''} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Previsão de Fechamento</Label>
                  <Input id="expectedCloseDate" name="expectedCloseDate" type="date" value={formData.expectedCloseDate || ''} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select value={formData.ownerUserId} onValueChange={(val) => handleSelectChange('ownerUserId', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersResponse?.data.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={formData.organizationId || ''} onValueChange={(val) => handleSelectChange('organizationId', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgsResponse?.data.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.organizationId && (
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Select value={formData.contactId || ''} onValueChange={(val) => handleSelectChange('contactId', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um contato" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactsResponse?.data.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="min-h-[100px]" />
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={handleSave}
                  disabled={updateDealMutation.isPending}
                >
                  {updateDealMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <DealTimeline dealId={dealId} />
            </TabsContent>

            <TabsContent value="activities" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Módulo de atividades em desenvolvimento.
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
