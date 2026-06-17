'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, LogOut, Laptop, Smartphone } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Session {
  id: string;
  familyId: string;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  lastActivityAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      const { data } = await apiClient.get('/sessions');
      setSessions(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar sessões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await apiClient.delete(`/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Erro ao revogar sessão.');
    }
  };

  const handleGlobalLogout = async () => {
    if (!confirm('Tem certeza que deseja sair de todos os outros dispositivos?')) return;
    try {
      await apiClient.delete('/sessions/global');
      fetchSessions();
    } catch (err: any) {
      alert('Erro ao encerrar as sessões.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Segurança da Conta</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dispositivos ativos e as configurações de segurança.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Sessões Ativas
          </CardTitle>
          <CardDescription>
            Aqui você vê em quais dispositivos sua conta está conectada no momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-secondary rounded-lg">
                      {session.deviceType === 'MOBILE' ? (
                        <Smartphone className="w-6 h-6" />
                      ) : (
                        <Laptop className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {session.deviceName || 'Dispositivo Desconhecido'}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            Sessão Atual
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.browser || 'Navegador desconhecido'} em {session.city ? `${session.city}, ${session.country}` : session.ipAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Última atividade: {new Date(session.lastActivityAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(session.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Revogar
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button variant="outline" onClick={handleGlobalLogout} disabled={loading || sessions.length <= 1}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair de todos os outros dispositivos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
