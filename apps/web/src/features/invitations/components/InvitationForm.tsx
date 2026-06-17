import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function InvitationForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get('/roles');
        setRoles(data);
        if (data.length > 0) setRoleId(data[0].id);
      } catch (err) {
        console.error('Erro ao buscar perfis:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/invitations', { email, roleId });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
          placeholder="exemplo@empresa.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
        <select
          required
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 dark:bg-zinc-700 dark:text-white"
        >
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name} {r.isSystem ? '(Sistema)' : ''}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !roleId}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Convite'}
        </button>
      </div>
    </form>
  );
}
