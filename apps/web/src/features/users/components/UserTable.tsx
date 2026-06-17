import Link from 'next/link';
import { UserStatusBadge } from './UserStatusBadge';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  isLoading: boolean;
}

export function UserTable({ users, isLoading }: UserTableProps) {
  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-10 text-gray-500 border border-gray-200 dark:border-zinc-700 rounded-lg">Nenhum usuário encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
        <thead className="bg-gray-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cargo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acesso</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <UserStatusBadge isActive={user.isActive} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {user.jobTitle || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/users/${user.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
