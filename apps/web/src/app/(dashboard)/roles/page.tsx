'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleTable } from '@/features/rbac/components/RoleTable';
import { apiClient } from '@/lib/api-client';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get('/roles');
        setRoles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfis de Acesso</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie níveis de permissão da sua organização.</p>
        </div>
        <Link 
          href="/roles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Criar Perfil
        </Link>
      </div>

      <RoleTable roles={roles} isLoading={loading} />
    </div>
  );
}
