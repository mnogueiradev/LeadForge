'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      
      const { data } = await apiClient.get(`/security-logs?${params.toString()}`);
      setLogs(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severity]);

  const getSeverityBadge = (s: string) => {
    switch(s) {
      case 'INFO': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">INFO</span>;
      case 'WARNING': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">WARNING</span>;
      case 'ERROR': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">ERROR</span>;
      case 'CRITICAL': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">CRITICAL</span>;
      default: return <span>{s}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logs de Segurança</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitoramento de acesso, identidade e incidentes.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select 
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          className="border border-gray-300 dark:border-zinc-700 px-3 py-2 rounded-md bg-white dark:bg-zinc-800 text-sm"
        >
          <option value="">Todas Severidades</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP / Agente</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema / Desconhecido'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-mono text-xs">{log.ipAddress}</div>
                    <div className="text-xs truncate max-w-xs" title={log.userAgent}>{log.userAgent}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
