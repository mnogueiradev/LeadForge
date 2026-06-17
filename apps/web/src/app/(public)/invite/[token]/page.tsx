'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    jobTitle: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await apiClient.get(`/invite/${token}`);
        setInvite(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Convite inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await apiClient.post(`/invite/${token}/accept`, formData);
      alert('Conta ativada com sucesso! Você já pode fazer login.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar o aceite do convite.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verificando convite...</div>;

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-sm text-center border border-gray-200 dark:border-zinc-700">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Convite Inválido</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline">Voltar para o Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Complete seu perfil
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Você foi convidado(a) para entrar na equipe de <span className="font-semibold text-gray-900 dark:text-white">{invite.tenant.name}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-zinc-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
              <div className="mt-1">
                <input type="email" disabled value={invite.email} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm opacity-60 bg-gray-50 dark:bg-zinc-700 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <div className="mt-1">
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm dark:bg-zinc-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sobrenome</label>
                <div className="mt-1">
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm dark:bg-zinc-700 dark:text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <div className="mt-1">
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm dark:bg-zinc-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <div className="mt-1">
                  <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm dark:bg-zinc-700 dark:text-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Defina sua Senha</label>
              <div className="mt-1">
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm dark:bg-zinc-700 dark:text-white" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres.</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Ativando...' : 'Aceitar Convite e Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
