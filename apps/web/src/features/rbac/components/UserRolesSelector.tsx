import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface UserRolesSelectorProps {
  userId?: string;
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}

export function UserRolesSelector({ userId, selectedRoleIds, onChange }: UserRolesSelectorProps) {
  const [roles, setRoles] = useState<any[]>([]);
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

  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter(id => id !== roleId));
    } else {
      onChange([...selectedRoleIds, roleId]);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Carregando perfis...</div>;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfis de Acesso</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-gray-200 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800/50">
        {roles.map(role => (
          <label key={role.id} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRoleIds.includes(role.id)}
              onChange={() => toggleRole(role.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {role.name}
              {role.isSystem && <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">Sistema</span>}
            </span>
          </label>
        ))}
      </div>
      {selectedRoleIds.length === 0 && <p className="text-xs text-red-500">Selecione pelo menos um perfil de acesso.</p>}
    </div>
  );
}
