import * as React from 'react';
import {
  Briefcase,
  Calendar,
  LayoutDashboard,
  Users,
  Building2,
  Phone,
  Settings,
  ShieldCheck,
  Target,
  KanbanSquare,
  Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Empresas', url: '/organizations', icon: Building2 },
  { title: 'Contatos', url: '/contacts', icon: Phone },
  { title: 'Leads', url: '/leads', icon: Target },
  { title: 'Pipelines', url: '/pipelines', icon: KanbanSquare },
  { title: 'Negócios', url: '/deals', icon: Briefcase },
  { title: 'Atividades', url: '/activities', icon: Activity },
  { title: 'Calendário', url: '/calendar', icon: Calendar },
];

const adminItems = [
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-16 items-center border-b px-6">
        {state === 'expanded' && <h2 className="text-xl text-emerald-600 font-bold tracking-tight">LeadForge</h2>}
        {state === 'collapsed' && <h2 className="text-xl text-emerald-600 font-bold tracking-tight">LF</h2>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Base</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? 'bg-emerald-500/10 text-emerald-600 font-medium' : ''
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? 'bg-emerald-500/10 text-emerald-600 font-medium' : ''
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
