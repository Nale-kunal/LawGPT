import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Bell
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
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useLegalData();
  const { state, setOpen } = useSidebar();
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  const handleNavigation = (href: string) => {
    navigate(href);
    // Auto-collapse sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <SidebarComponent 
      className="border-sidebar-border hover:w-64 transition-all duration-300"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Scale className="h-8 w-8 text-primary flex-shrink-0" />
          {state !== "collapsed" && (
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-sidebar-foreground truncate">LegalPro</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">Indian Law Management</p>
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
                        "cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <div 
                        onClick={() => handleNavigation(item.href)} 
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                        {(item.name === 'Dashboard' || item.name === 'Notifications') && unreadAlerts > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                            {unreadAlerts}
                          </Badge>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </SidebarComponent>
  );
};