'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadInfo } from './_components/lead-info';
import { LeadTimeline } from './_components/lead-timeline';
import { LeadAttachments } from './_components/lead-attachments';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Clock, Paperclip } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await api.get(`/leads/${id}`);
      return response.data; // Adapte caso o interceptor não extraia .data
    },
  });

  if (isLoading) {
    return <div className="p-8">Carregando detalhes...</div>;
  }

  if (isError || !lead) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Lead não encontrado</h2>
        <Button onClick={() => router.push('/leads')} className="mt-4">
          Voltar para Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leads">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{lead.title}</h2>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <Info className="mr-2 h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="attachments">
            <Paperclip className="mr-2 h-4 w-4" />
            Anexos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <LeadInfo lead={lead} />
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="max-w-3xl">
            <LeadTimeline leadId={lead.id} />
          </div>
        </TabsContent>
        
        <TabsContent value="attachments">
          <div className="max-w-3xl">
            <LeadAttachments leadId={lead.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
