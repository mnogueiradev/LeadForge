import { useAuthStore } from '../stores/auth.store';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    // O backend decide se as permissões vêm no JWT, no /me ou num endpoint dedicado.
    // Aqui avaliamos o estado local que já foi populado após o login
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return { hasPermission, hasRole };
}
