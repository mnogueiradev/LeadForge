'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!token && !pathname.startsWith('/auth') && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password') {
        router.push('/login');
      }
    }
  }, [token, pathname, router, isMounted]);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we are on an auth route and have a token, redirect to dashboard
  if (token && (pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup')) {
    router.push('/dashboard');
    return null;
  }

  // If no token and trying to access protected route, render nothing (will redirect)
  if (!token && !pathname.startsWith('/auth') && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password') {
    return null;
  }

  return <>{children}</>;
}
