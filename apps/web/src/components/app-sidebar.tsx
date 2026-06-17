'use client';

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
} from 'lucide-react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: Users,
  },
  {
    title: 'Negócios (Deals)',
    url: '/deals',
    icon: Briefcase,
  },
  {
    title: 'Contatos',
    url: '/contacts',
    icon: Phone,
  },
  {
    title: 'Empresas',
    url: '/organizations',
    icon: Building2,
  },
  {
    title: 'Calendário',
    url: '/calendar',
    icon: Calendar,
  },
];

const adminItems = [
  {
    title: 'Usuários',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Papéis & Permissões',
    url: '/roles',
    icon: ShieldCheck,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-6">
        <h2 className="text-xl font-bold tracking-tight">LeadForge</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Base</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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
