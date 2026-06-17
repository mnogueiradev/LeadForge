import { useState, useEffect } from 'react';

export function UserFilters({ onSearch }: { onSearch: (search: string, status: string) => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Simple debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(search, status);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, status, onSearch]);

  return (
    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          className="block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
    </div>
  );
}
