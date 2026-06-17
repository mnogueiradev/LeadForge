'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col flex-1 min-h-screen overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 bg-muted/20">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </AuthGuard>
  );
}
