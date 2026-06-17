'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleForm } from '@/features/rbac/components/RoleForm';
import { PermissionMatrix } from '@/features/rbac/components/PermissionMatrix';
import { apiClient } from '@/lib/api-client';

export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [role, setRole] = useState<any>(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleRes, permsRes] = await Promise.all([
          apiClient.get(`/roles/${params.id}`),
          apiClient.get(`/permissions`)
        ]);
        setRole(roleRes.data);
        setAllPermissions(permsRes.data);
      } catch (err) {
        console.error(err);
        router.push('/roles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  const handleUpdate = async (data: any) => {
    await apiClient.patch(`/roles/${params.id}`, data);
    router.push('/roles');
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este perfil?')) return;
    await apiClient.delete(`/roles/${params.id}`);
    router.push('/roles');
  };

  const handleAssign = async (permissionIds: string[]) => {
    await apiClient.post(`/roles/${params.id}/permissions`, { permissionIds });
  };

  const handleRemove = async (permissionIds: string[]) => {
    await apiClient.delete(`/roles/${params.id}/permissions`, { data: { permissionIds } });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Perfil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role.isSystem ? 'Este é um perfil de sistema.' : 'Edite o nome e permissões.'}</p>
        </div>
        {!role.isSystem && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
          >
            Excluir Perfil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RoleForm 
            initialData={role}
            onSubmit={handleUpdate}
            onCancel={() => router.push('/roles')}
            isSystem={role.isSystem}
          />
        </div>
        <div className="lg:col-span-2">
          <PermissionMatrix 
            allPermissions={allPermissions}
            currentPermissions={role.permissions || []}
            onAssign={handleAssign}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}
