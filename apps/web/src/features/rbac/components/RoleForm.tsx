import { useState } from 'react';

export function RoleForm({ initialData, onSubmit, onCancel, isSystem = false }: any) {
  const [name, setName] = useState(initialData?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSystem) return; // Cannot rename system roles
    setLoading(true);
    setError('');
    try {
      await onSubmit({ name });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Perfil</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSystem}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 disabled:opacity-50 dark:bg-zinc-700 dark:text-white"
        />
        {isSystem && <p className="mt-1 text-xs text-gray-500">Perfis do sistema não podem ser renomeados.</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Voltar
        </button>
        {!isSystem && (
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        )}
      </div>
    </form>
  );
}
