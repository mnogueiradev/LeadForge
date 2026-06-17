'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { AuditDetailsDrawer } from '@/features/audit/components/AuditDetailsDrawer';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityName) params.append('entityName', entityName);
      if (action) params.append('action', action);
      
      const { data } = await apiClient.get(`/audit-logs?${params.toString()}`);
      setLogs(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityName, action]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoria de Negócios</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rastreabilidade de todas as alterações estruturais na plataforma.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="Entidade (ex: User, Role)" 
          value={entityName}
          onChange={e => setEntityName(e.target.value)}
          className="border border-gray-300 dark:border-zinc-700 px-3 py-2 rounded-md bg-white dark:bg-zinc-800 text-sm"
        />
        <input 
          type="text" 
          placeholder="Ação (ex: CREATED, UPDATED)" 
          value={action}
          onChange={e => setAction(e.target.value)}
          className="border border-gray-300 dark:border-zinc-700 px-3 py-2 rounded-md bg-white dark:bg-zinc-800 text-sm"
        />
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Carregando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum log encontrado.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {log.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      Ver Payload
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setSelectedLog(null)} />
          <AuditDetailsDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
        </>
      )}
    </div>
  );
}
