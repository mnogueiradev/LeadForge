'use client';

import { useState } from 'react';

export function AuditDetailsDrawer({ log, onClose }: { log: any, onClose: () => void }) {
  if (!log) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
      <div className="w-screen max-w-md pointer-events-auto">
        <div className="flex flex-col h-full bg-white dark:bg-zinc-800 shadow-xl overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Detalhes da Auditoria</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative flex-1 px-4 py-6 sm:px-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID do Log</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white break-all">{log.id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entidade</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{log.entityName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ação</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{log.action}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">IP</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{log.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Request ID</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs">{log.requestId || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{log.userAgent || 'N/A'}</p>
            </div>

            {log.oldValues && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valores Anteriores</h3>
                <pre className="mt-2 bg-gray-50 dark:bg-zinc-900 p-3 rounded-md text-xs overflow-auto border border-gray-200 dark:border-zinc-700 text-red-600 dark:text-red-400">
                  {JSON.stringify(log.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {log.newValues && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Novos Valores</h3>
                <pre className="mt-2 bg-gray-50 dark:bg-zinc-900 p-3 rounded-md text-xs overflow-auto border border-gray-200 dark:border-zinc-700 text-green-600 dark:text-green-400">
                  {JSON.stringify(log.newValues, null, 2)}
                </pre>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
