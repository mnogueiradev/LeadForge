'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Save, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SecurityPoliciesPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const { data } = await apiClient.get('/security-settings');
      setPolicy(data.data);
    } catch (err: any) {
      setError('Erro ao carregar políticas de segurança. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await apiClient.patch('/security-settings', policy);
      setSuccessMessage('Políticas de segurança atualizadas com sucesso.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError('Erro ao salvar as políticas. ' + (err.response?.data?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordPolicy = (key: string, value: any) => {
    setPolicy({ ...policy, passwordPolicy: { ...policy.passwordPolicy, [key]: value } });
  };

  const updateSessionPolicy = (key: string, value: any) => {
    setPolicy({ ...policy, sessionPolicy: { ...policy.sessionPolicy, [key]: value } });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando políticas...</div>;
  if (!policy) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Políticas de Segurança</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as regras globais de segurança aplicadas a todos os usuários da organização.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Erro ao salvar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* POLÍTICA DE SENHAS */}
        <Card>
          <CardHeader>
            <CardTitle>Política de Senhas</CardTitle>
            <CardDescription>Requisitos para a criação e alteração de senhas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Comprimento Mínimo</Label>
              <Input 
                type="number" 
                value={policy.passwordPolicy.minLength} 
                onChange={e => updatePasswordPolicy('minLength', parseInt(e.target.value))} 
                min={8} max={64}
              />
              {policy.passwordPolicy.minLength < 8 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  Senhas curtas são altamente vulneráveis. O mínimo recomendado é 8.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Letras Maiúsculas</Label>
                <p className="text-xs text-muted-foreground">Pelo menos uma (A-Z)</p>
              </div>
              <Switch checked={policy.passwordPolicy.requireUppercase} onCheckedChange={v => updatePasswordPolicy('requireUppercase', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Números</Label>
                <p className="text-xs text-muted-foreground">Pelo menos um (0-9)</p>
              </div>
              <Switch checked={policy.passwordPolicy.requireNumbers} onCheckedChange={v => updatePasswordPolicy('requireNumbers', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Caracteres Especiais</Label>
                <p className="text-xs text-muted-foreground">Ex: @, #, $, !</p>
              </div>
              <Switch checked={policy.passwordPolicy.requireSpecialChars} onCheckedChange={v => updatePasswordPolicy('requireSpecialChars', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bloquear Senhas Comuns</Label>
                <p className="text-xs text-muted-foreground">Protege contra dicionários</p>
              </div>
              <Switch checked={policy.passwordPolicy.preventCommonPasswords} onCheckedChange={v => updatePasswordPolicy('preventCommonPasswords', v)} />
            </div>
          </CardContent>
        </Card>

        {/* POLÍTICA DE SESSÕES */}
        <Card>
          <CardHeader>
            <CardTitle>Política de Sessões</CardTitle>
            <CardDescription>Limites de concorrência e duração dos acessos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sessões Simultâneas por Usuário</Label>
              <Select 
                value={policy.sessionPolicy.maxConcurrentSessions.toString()} 
                onValueChange={v => updateSessionPolicy('maxConcurrentSessions', parseInt(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Restrito)</SelectItem>
                  <SelectItem value="3">3 Dispositivos</SelectItem>
                  <SelectItem value="5">5 Dispositivos</SelectItem>
                  <SelectItem value="0">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se exceder, a sessão mais antiga será desconectada automaticamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Timeout por Inatividade (minutos)</Label>
              <Input 
                type="number" 
                value={policy.sessionPolicy.idleTimeoutMinutes} 
                onChange={e => updateSessionPolicy('idleTimeoutMinutes', parseInt(e.target.value))} 
                min={0}
              />
              <p className="text-xs text-muted-foreground">Use 0 para não desconectar por inatividade.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Políticas
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
