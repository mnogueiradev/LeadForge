import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Invitation {
  id: string;
  email: string;
  role: { name: string };
  status: string;
  expiresAt: string;
}

export function InvitationTable({ invitations, isLoading, onRefresh }: { invitations: Invitation[], isLoading: boolean, onRefresh: () => void }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleResend = async (id: string) => {
    setProcessingId(id);
    try {
      await apiClient.post(`/invitations/${id}/resend`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao reenviar convite');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;
    setProcessingId(id);
    try {
      await apiClient.post(`/invitations/${id}/cancel`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar convite');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <div className="text-center py-10">Carregando...</div>;
  if (invitations.length === 0) return <div className="text-center py-10 border rounded-lg">Nenhum convite encontrado.</div>;

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'ACCEPTED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aceito</span>;
    if (status === 'CANCELLED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Cancelado</span>;
    if (new Date(expiresAt) < new Date()) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Expirado</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Pendente</span>;
  };

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
        <thead className="bg-gray-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
          {invitations.map((inv) => (
            <tr key={inv.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {inv.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {inv.role?.name || '---'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStatusBadge(inv.status, inv.expiresAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                {(inv.status === 'PENDING' || inv.status === 'EXPIRED') && new Date(inv.expiresAt) < new Date() && (
                  <button 
                    onClick={() => handleResend(inv.id)} 
                    disabled={processingId === inv.id}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 disabled:opacity-50"
                  >
                    Reenviar
                  </button>
                )}
                {inv.status === 'PENDING' && new Date(inv.expiresAt) >= new Date() && (
                  <>
                    <button 
                      onClick={() => handleResend(inv.id)} 
                      disabled={processingId === inv.id}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 disabled:opacity-50"
                    >
                      Reenviar
                    </button>
                    <button 
                      onClick={() => handleCancel(inv.id)} 
                      disabled={processingId === inv.id}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
