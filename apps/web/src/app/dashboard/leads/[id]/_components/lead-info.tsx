'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Lead = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  temperature: string;
  estimatedValue: string | null;
  createdAt: string;
  contact: { id: string; firstName: string; lastName: string | null; primaryEmail: string; primaryPhone: string | null } | null;
  organization: { id: string; name: string } | null;
};

export function LeadInfo({ lead }: { lead: Lead }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Oportunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Título</span>
            <p>{lead.title}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Status / Temperatura</span>
            <div className="flex gap-2 mt-1">
              <Badge>{lead.status}</Badge>
              <Badge variant="outline">{lead.temperature}</Badge>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Valor Estimado</span>
            <p>
              {lead.estimatedValue 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(lead.estimatedValue))
                : 'Não informado'}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Descrição</span>
            <p className="whitespace-pre-wrap">{lead.description || 'Sem descrição'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Criado em</span>
            <p>{format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato & Organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lead.contact ? (
            <>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Nome</span>
                <p>{lead.contact.firstName} {lead.contact.lastName || ''}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <p>{lead.contact.primaryEmail}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Telefone</span>
                <p>{lead.contact.primaryPhone || 'Não informado'}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Nenhum contato associado.</p>
          )}

          <div className="pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Organização</span>
            <p>{lead.organization ? lead.organization.name : 'Nenhuma organização associada.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
