import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSettings } from '../api/use-settings';

import { GeneralSettingsTab } from '../components/tabs/GeneralSettingsTab';
import { CRMSettingsTab } from '../components/tabs/CRMSettingsTab';
import { UsersSettingsTab } from '../components/tabs/UsersSettingsTab';
import { AppearanceSettingsTab } from '../components/tabs/AppearanceSettingsTab';
import { NotificationsSettingsTab } from '../components/tabs/NotificationsSettingsTab';
import { IntegrationsSettingsTab } from '../components/tabs/IntegrationsSettingsTab';

export function SettingsPage() {
  const { data: settingsData, isLoading, error } = useSettings();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">Falha ao carregar configurações.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Recarregar página</Button>
      </div>
    );
  }

  // Convert settings array to a flat object dictionary
  // e.g. [{ key: 'company_name', value: 'My Co' }] -> { company_name: 'My Co' }
  const initialData = React.useMemo(() => {
    if (!settingsData) return {};
    return settingsData.reduce((acc: Record<string, any>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }, [settingsData]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie os parâmetros globais e configurações do CRM.</p>
        </div>
      </div>

      <div className="mt-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <div className="border rounded-md p-6 bg-card text-card-foreground shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground animate-pulse">Carregando configurações...</p>
              </div>
            ) : (
              <>
                <TabsContent value="general" className="mt-0">
                  <GeneralSettingsTab initialData={initialData} />
                </TabsContent>

                <TabsContent value="crm" className="mt-0">
                  <CRMSettingsTab initialData={initialData} />
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                  <UsersSettingsTab />
                </TabsContent>

                <TabsContent value="appearance" className="mt-0">
                  <AppearanceSettingsTab initialData={initialData} />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <NotificationsSettingsTab initialData={initialData} />
                </TabsContent>

                <TabsContent value="integrations" className="mt-0">
                  <IntegrationsSettingsTab />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
