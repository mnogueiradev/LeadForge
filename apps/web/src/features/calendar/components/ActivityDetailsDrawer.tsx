import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  useCompleteActivity, 
  useCancelActivity 
} from '@/features/activities/api/use-activities';
import { 
  Calendar, Clock, User, Building2, Phone, AlignLeft, 
  MapPin, Flag, Check, X, Pencil, DollarSign, Activity as ActivityIcon, Link as LinkIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { calculateDealHealth, getDealHealthColor } from '@/features/deals/utils/deal-health';

interface ActivityDetailsDrawerProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export function ActivityDetailsDrawer({ activity, isOpen, onClose, onEdit }: ActivityDetailsDrawerProps) {
  const completeActivity = useCompleteActivity();
  const cancelActivity = useCancelActivity();
  const navigate = useNavigate();

  if (!activity) return null;

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Ligação';
      case 'meeting': return 'Reunião';
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'follow_up': return 'Follow-up';
      case 'task': return 'Tarefa';
      default: return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'; // Verde via global.css config se necessário, senão default
      case 'pending': return 'secondary';
      case 'canceled': return 'destructive';
      default: return 'outline';
    }
  };

  const formattedDate = activity.dueDate ? format(new Date(activity.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';
  const formattedTime = activity.dueDate ? format(new Date(activity.dueDate), "HH:mm") : '';

  const isEditable = activity.status === 'pending';

  const handleComplete = async () => {
    try {
      await completeActivity.mutateAsync(activity.id);
      toast.success('Atividade concluída com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao concluir atividade');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelActivity.mutateAsync(activity.id);
      toast.success('Atividade cancelada');
      onClose();
    } catch (error) {
      toast.error('Erro ao cancelar atividade');
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">
        <div className="p-6 pb-2">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {getActivityTypeLabel(activity.type)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(activity.status)}>
                  {activity.status === 'completed' ? 'Concluída' : activity.status === 'pending' ? 'Pendente' : 'Cancelada'}
                </Badge>
              </div>
              
              {/* Quick Actions */}
              {isEditable && (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={handleComplete} disabled={completeActivity.isPending} title="Concluir">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel} disabled={cancelActivity.isPending} title="Cancelar">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onEdit(activity)} title="Editar">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
            <SheetTitle className="text-xl">{activity.title}</SheetTitle>
            <SheetDescription>
              Criada em {format(new Date(activity.createdAt), "dd/MM/yyyy HH:mm")}
            </SheetDescription>
          </SheetHeader>
        </div>

        <Tabs defaultValue="geral" className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6 pt-4 overflow-y-auto">
            <TabsContent value="geral" className="mt-0 space-y-6">
              {/* Horário */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {formattedTime} {activity.durationMinutes ? `(${activity.durationMinutes} min)` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                 <Flag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                 <div>
                   <p className="font-medium">Prioridade</p>
                   <p className="text-sm text-muted-foreground">{getPriorityLabel(activity.priority)}</p>
                 </div>
              </div>

              {activity.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Local / Link</p>
                    <p className="text-sm text-muted-foreground break-all">{activity.location}</p>
                  </div>
                </div>
              )}

              {/* Descrição */}
              {activity.description && (
                <div className="flex items-start gap-3">
                  <AlignLeft className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Descrição</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-md border">
                      {activity.description}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crm" className="mt-0 space-y-6">
              {/* Empresa */}
              {activity.organization && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Empresa
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigate(`/organizations/${activity.organization?.id}`)}>
                      Ver Empresa <LinkIcon className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium">{activity.organization.name}</p>
                </div>
              )}

              {/* Contato */}
              {activity.contact && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Contato
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigate(`/contacts/${activity.contact?.id}`)}>
                      Ver Contato <LinkIcon className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium">{activity.contact.firstName} {activity.contact.lastName}</p>
                </div>
              )}

              {/* Negócio */}
              {activity.deal && (
                <div className="space-y-3 bg-muted/30 p-3 rounded-md border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" /> Negócio Associado
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigate(`/deals?dealId=${activity.deal?.id}`)}>
                      Ver Deal <LinkIcon className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-base">{activity.deal.title}</p>
                    {activity.deal.updatedAt && (
                      <Badge className={`${getDealHealthColor(calculateDealHealth(activity.deal.updatedAt).status)}`}>
                        {calculateDealHealth(activity.deal.updatedAt).status === 'HEALTHY' ? 'Saudável' : 
                         calculateDealHealth(activity.deal.updatedAt).status === 'WARNING' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Pipeline / Etapa</p>
                      <p className="text-sm font-medium truncate" title={`${activity.deal.pipeline?.name} > ${activity.deal.stage?.name}`}>
                        {activity.deal.pipeline?.name || 'N/A'} <br/> 
                        <span className="text-muted-foreground">{activity.deal.stage?.name || 'N/A'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor e Probabilidade</p>
                      <p className="text-sm font-medium text-emerald-600">{formatCurrency(activity.deal.value)}</p>
                      <p className="text-xs text-muted-foreground">{activity.deal.stage?.probability || 0}% de Fechamento</p>
                    </div>
                  </div>
                </div>
              )}

              {(!activity.organization && !activity.contact && !activity.deal) && (
                <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md bg-muted/20 border-dashed">
                  <ActivityIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Nenhum contexto associado</p>
                  <p className="text-xs text-muted-foreground">Esta atividade não possui empresa, contato ou negócio vinculados.</p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" /> Responsável
                </p>
                {activity.ownerUser ? (
                  <p className="font-medium">{activity.ownerUser.firstName} {activity.ownerUser.lastName}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Não atribuído</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
