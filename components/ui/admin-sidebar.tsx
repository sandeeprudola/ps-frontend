'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Boxes,
  FileBarChart,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';

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
  SidebarSeparator,
} from '@/components/ui/sidebar';

const primaryItems = [
  { title: 'Overview', icon: Sparkles, href: '#overview' },
  { title: 'Founder', icon: ShieldCheck, href: '#founder', founderOnly: true },
  { title: 'Analytics', icon: BarChart3, href: '#analytics' },
  { title: 'Users', icon: Users, href: '#users' },
  { title: 'Staff', icon: UsersRound, href: '#staff' },
  { title: 'Attendance', icon: ClipboardCheck, href: '#attendance' },
  { title: 'Appointments', icon: CalendarClock, href: '#appointments' },
  { title: 'Leads', icon: UserCog, href: '#leads' },
  { title: 'Inventory', icon: Boxes, href: '#inventory' },
  { title: 'Reports', icon: FileBarChart, href: '#reports' },
];

const secondaryItems = [
  { title: 'Admin Access', icon: ShieldCheck, href: '#admin-access' },
];

interface AdminSidebarProps {
  adminName?: string;
  adminRole?: string;
  onLogout?: () => void;
}

export const AdminSidebar = memo(
  ({ adminName, adminRole, onLogout }: AdminSidebarProps) => {
    const { theme, setTheme } = useTheme();

    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-4 p-4">
          <Link
            prefetch={false}
            href="#overview"
            className="rounded-2xl border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(226,232,240,0.92),_rgba(191,219,254,0.7))] p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-950">
                  PS Admin Console
                </div>
                <div className="truncate text-xs text-slate-500">
                  Clinic operations panel
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/80 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Signed in as
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-slate-950">
                {adminName || 'Admin'}
              </div>
              <div className="truncate text-xs text-slate-500">
                {adminRole || 'admin'}
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryItems
                  .filter((item) => !item.founderOnly || adminRole === 'super-admin')
                  .map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild size="lg">
                        <Link prefetch={false} href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Access</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link prefetch={false} href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link prefetch={false} href="#admin-access">
                    <UserCog />
                    <span>Account controls</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout}>
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  },
);

AdminSidebar.displayName = 'AdminSidebar';
