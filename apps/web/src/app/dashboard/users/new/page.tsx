'use client';

import { useRouter } from 'next/navigation';
import { UserForm } from '@/features/users/components/UserForm';
import { apiClient } from '@/lib/api-client';

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await apiClient.post('/users', data);
    router.push('/users');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Adicionar Usuário</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Insira os dados para convidar um novo membro.</p>
      </div>

      <UserForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/users')}
      />
    </div>
  );
}
