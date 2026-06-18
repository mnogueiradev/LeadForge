'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store'; // ajuste o import se necessário

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  
  // Controle para saber se o Zustand já carregou o localStorage
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Se ainda não hidratou o estado do localStorage, não faça NADA.
    if (!isHydrated) return; 

    const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

    if (!token && !isAuthRoute) {
      router.push('/login');
    } else if (token && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [token, isHydrated, pathname, router]);

  // Evita a tela "piscar" mostrando o painel antes de redirecionar
  if (!isHydrated) {
    return null; // Opcional: Coloque um <LoadingSpinner /> aqui
  }

  return <>{children}</>;
}