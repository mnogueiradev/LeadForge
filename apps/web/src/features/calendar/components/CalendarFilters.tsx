import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useUsers } from '@/features/users/api/use-users';
import { useOrganizations } from '@/features/organizations/api/use-organizations';
import { useContacts } from '@/features/contacts/api/use-contacts';
import { usePipelines, usePipelineStages } from '@/features/pipelines/api/use-pipelines';

export function CalendarFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data: usersData } = useUsers();
  const users = Array.isArray(usersData) ? usersData : usersData?.data ?? [];

  const { data: orgsData } = useOrganizations({ limit: 100 });
  const organizations = Array.isArray(orgsData) ? orgsData : orgsData?.data ?? [];

  const selectedOrgId = searchParams.get('organizationId');
  const { data: contactsData } = useContacts({ 
    organizationId: selectedOrgId || undefined,
    limit: 100 
  });
  const contacts = Array.isArray(contactsData) ? contactsData : contactsData?.data ?? [];

  const { data: pipelinesData } = usePipelines();
  const pipelines = Array.isArray(pipelinesData) ? pipelinesData : pipelinesData?.items ?? [];

  const selectedPipelineId = searchParams.get('pipelineId');
  const { data: stagesData } = usePipelineStages(selectedPipelineId || '');
  const stages = Array.isArray(stagesData) ? stagesData : stagesData?.items ?? [];

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value === 'all' || !value) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      
      // Cascading clear
      if (key === 'organizationId' && value === 'all') {
        newParams.delete('contactId');
      }
      if (key === 'pipelineId' && value === 'all') {
        newParams.delete('stageId');
      }
      
      return newParams;
    }, { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('q', e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Busca Global */}
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar atividade por título, empresa, contato ou negócio..." 
          className="pl-9 bg-background w-full"
          value={searchParams.get('q') || ''}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-[180px]">
          <Select
            value={searchParams.get('ownerUserId') || 'all'}
            onValueChange={(value) => handleFilterChange('ownerUserId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Responsável</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={searchParams.get('type') || 'all'}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tipo</SelectItem>
              <SelectItem value="call">Ligação</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="task">Tarefa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={searchParams.get('status') || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Commercial Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-[180px]">
          <Select
            value={searchParams.get('organizationId') || 'all'}
            onValueChange={(value) => handleFilterChange('organizationId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Empresa</SelectItem>
              {organizations.map((org: any) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={searchParams.get('contactId') || 'all'}
            onValueChange={(value) => handleFilterChange('contactId', value)}
            disabled={!selectedOrgId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Contato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Contato</SelectItem>
              {contacts.map((contact: any) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={searchParams.get('pipelineId') || 'all'}
            onValueChange={(value) => handleFilterChange('pipelineId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Pipeline</SelectItem>
              {pipelines.map((pipeline: any) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={searchParams.get('stageId') || 'all'}
            onValueChange={(value) => handleFilterChange('stageId', value)}
            disabled={!selectedPipelineId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Etapa</SelectItem>
              {stages.map((stage: any) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
