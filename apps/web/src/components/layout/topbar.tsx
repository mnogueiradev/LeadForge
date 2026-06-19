import * as React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/layout/global-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tenants = [
  { id: '1', name: 'LeadForge Demo' },
  { id: '2', name: 'Acme Inc' },
  { id: '3', name: 'Tech Solutions' },
];

export function Topbar() {
  const { toggleSidebar, state, isMobile } = useSidebar();
  const [activeTenant, setActiveTenant] = React.useState(tenants[0]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
        {/* Mobile Sidebar Toggle */}
        <SidebarTrigger className="md:hidden" />
        
        {/* Desktop Sidebar Toggle (optional if we want a button on topbar, but Shadcn sidebar usually has its own toggle or we use SidebarTrigger) */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>

        {/* Tenant Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start font-medium">
                <span className="truncate">{activeTenant.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuLabel>Organizações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenants.map((tenant) => (
                <DropdownMenuItem 
                  key={tenant.id} 
                  onClick={() => setActiveTenant(tenant)}
                  className={activeTenant.id === tenant.id ? 'bg-muted' : ''}
                >
                  {tenant.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Global Search Button (triggers command palette) */}
          <Button 
            variant="outline" 
            className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Buscar...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Nav */}
          <UserNav />
        </div>
      </header>
      <GlobalSearch />
    </>
  );
}
