'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm } from '@/features/users/components/UserForm';
import { apiClient } from '@/lib/api-client';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await apiClient.get(`/users/${params.id}`);
        setUser(data);
      } catch (err) {
        console.error(err);
        router.push('/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    await apiClient.patch(`/users/${params.id}`, data);
    router.push('/users');
  };

  const handleToggleStatus = async () => {
    const action = user.isActive ? 'deactivate' : 'activate';
    await apiClient.patch(`/users/${params.id}/${action}`);
    setUser({ ...user, isActive: !user.isActive });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Usuário</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Atualize as informações do membro.</p>
        </div>
        <button
          onClick={handleToggleStatus}
          className={`px-4 py-2 text-sm font-medium rounded-md border ${
            user.isActive 
              ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:bg-red-900/20' 
              : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20'
          }`}
        >
          {user.isActive ? 'Desativar Usuário' : 'Reativar Usuário'}
        </button>
      </div>

      <UserForm 
        initialData={user}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/users')}
      />
    </div>
  );
}
