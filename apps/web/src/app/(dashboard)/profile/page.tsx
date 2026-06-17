'use client';

import { useState, useEffect } from 'react';
import { UserForm } from '@/features/users/components/UserForm';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (data: any) => {
    await apiClient.patch('/users/profile', data);
    alert('Perfil atualizado com sucesso!');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie suas informações pessoais.</p>
      </div>

      <UserForm 
        initialData={user}
        onSubmit={handleSubmit}
        onCancel={() => {}}
        isProfile={true}
      />
    </div>
  );
}
