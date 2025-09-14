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
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLegalData } from '@/contexts/LegalDataContext';

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
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
        <Scale className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-sidebar-foreground">LegalPro</h1>
          <p className="text-xs text-sidebar-foreground/60">Indian Law Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.name === 'Dashboard' && unreadAlerts > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {unreadAlerts}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Alerts Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Notifications</span>
          {unreadAlerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadAlerts}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};