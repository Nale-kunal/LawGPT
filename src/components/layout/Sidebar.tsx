import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  Receipt, 
  FolderOpen, 
  Settings,
  Scale,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeftRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLegalData } from '@/contexts/LegalDataContext';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/dashboard/cases', icon: FileText },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Legal Research', href: '/dashboard/legal-research', icon: BookOpen },
  { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { name: 'Documents', href: '/dashboard/documents', icon: FolderOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { alerts } = useLegalData();
  const { state, toggleSidebar } = useSidebar();
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <SidebarComponent 
      className="border-sidebar-border group hover:[&_[data-sidebar=group-label]]:opacity-100"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border px-3">
        <div className="flex items-center gap-2 py-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          {state !== "collapsed" && (
            <div className="min-w-0 text-left">
              <h1 className="text-lg font-bold text-sidebar-foreground truncate leading-tight">LegalPro</h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">Indian Law Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        {item.name === 'Dashboard' && unreadAlerts > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            {unreadAlerts}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadAlerts > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {unreadAlerts}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Desktop expand/collapse control at bottom */}
      <SidebarFooter className="border-t border-sidebar-border mt-auto">
        <div className="w-full px-2 py-2 flex items-center justify-center">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title={state === 'collapsed' ? 'Expand' : 'Collapse'}
          >
            <ChevronsLeftRight className="h-4 w-4" />
            <span className="sr-only">{state === 'collapsed' ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};