'use client';

import { useState, useEffect } from 'react';
import { UserTable } from '@/features/users/components/UserTable';
import { UserFilters } from '@/features/users/components/UserFilters';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (status !== 'all') params.isActive = status === 'active';
      
      const { data } = await apiClient.get('/users', { params });
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie o acesso da sua equipe.</p>
        </div>
        <Link 
          href="/users/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Novo Usuário
        </Link>
      </div>

      <UserFilters onSearch={(s, st) => { setSearch(s); setStatus(st); setPage(1); }} />

      <UserTable users={users} isLoading={loading} />
    </div>
  );
}
