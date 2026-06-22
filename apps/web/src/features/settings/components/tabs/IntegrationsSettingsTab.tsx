import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, MessageCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function IntegrationsSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte o LeadForge com as ferramentas que você já utiliza.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Preparação para crescimento</AlertTitle>
        <AlertDescription>
          A central de integrações será lançada nas próximas atualizações. Os módulos nativos já estão sendo desenvolvidos para escalar a sua operação.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-4">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Google Calendar
              </CardTitle>
              <CardDescription>
                Sincronização bidirecional de agenda e reuniões.
              </CardDescription>
            </div>
            <Badge variant="secondary">Não conectado</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Agende reuniões diretamente do CRM e visualize os compromissos importados da sua agenda do Google.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled className="w-full">
              Conectar Conta
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Microsoft Outlook
              </CardTitle>
              <CardDescription>
                Sincronização de e-mails e calendário do Office 365.
              </CardDescription>
            </div>
            <Badge variant="secondary">Não conectado</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Capture trocas de e-mail com os leads automaticamente e sincronize sua agenda corporativa.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled className="w-full">
              Conectar Conta
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                WhatsApp API
              </CardTitle>
              <CardDescription>
                Mensagens automatizadas e inbox integrado.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">Em breve</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Comunique-se com seus clientes via WhatsApp sem sair da plataforma e mantenha o histórico na timeline do lead.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" disabled className="w-full">
              Disponível em breve
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                OpenAI (Copilot)
              </CardTitle>
              <CardDescription>
                Inteligência Artificial para vendas.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">Em breve</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Resuma históricos longos, gere drafts de e-mail e obtenha insights automáticos sobre os negócios parados no funil.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" disabled className="w-full">
              Disponível em breve
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
