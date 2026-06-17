'use client';

import { useRouter } from 'next/navigation';
import { RoleForm } from '@/features/rbac/components/RoleForm';
import { apiClient } from '@/lib/api-client';

export default function NewRolePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const res = await apiClient.post('/roles', data);
    // Redirect to edit page to assign permissions
    router.push(`/roles/${res.data.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Criar Novo Perfil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dê um nome ao perfil. Você poderá atribuir permissões na próxima etapa.</p>
      </div>
      <RoleForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/roles')}
      />
    </div>
  );
}
