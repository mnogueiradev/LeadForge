'use client';

import { useState } from 'react';

import { UserRolesSelector } from '@/features/rbac/components/UserRolesSelector';

interface UserFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isProfile?: boolean;
}

export function UserForm({ initialData, onSubmit, onCancel, isProfile = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    jobTitle: initialData?.jobTitle || '',
    roleIds: initialData?.userRoles?.map((ur: any) => ur.roleId) || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
      {error && <div className="text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-md text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sobrenome</label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        
        {!isProfile && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
            <input
              type="email"
              name="email"
              required
              disabled={!!initialData}
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white disabled:opacity-50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
          />
        </div>

        {!isProfile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
            />
          </div>
        )}
      </div>

      {!isProfile && (
        <UserRolesSelector 
          selectedRoleIds={formData.roleIds} 
          onChange={(roleIds) => setFormData({ ...formData, roleIds })} 
        />
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
