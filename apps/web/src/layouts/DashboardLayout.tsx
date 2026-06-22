import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Topbar } from '@/components/layout/topbar';

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
