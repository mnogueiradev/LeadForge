'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      return;
    }
    
    setMessage('');
    setLoading(true);

    try {
      // TODO: Connect to backend reset-password using token from URL params
      // const token = searchParams.get('token');
      // await apiClient.post('/auth/reset-password', { token, password });
      
      setMessage('Senha alterada com sucesso! Você já pode fazer login.');
    } catch (err: any) {
      setMessage('Erro ao redefinir a senha. O token pode estar expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Digite sua nova senha.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sucesso') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full appearance-none rounded-lg border border-gray-300 dark:border-zinc-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-zinc-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full appearance-none rounded-lg border border-gray-300 dark:border-zinc-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-zinc-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || message.includes('sucesso')}
              className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Senha'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
