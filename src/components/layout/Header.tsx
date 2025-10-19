import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { LogOut, User, Bell, Moon, Sun, Menu, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLegalData } from '@/contexts/LegalDataContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const { profileData } = useSettings();
  const { alerts } = useLegalData();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    console.log('Navigating to settings...');
    navigate('/dashboard/settings');
  };

  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h2 className="text-sm md:text-lg font-semibold text-foreground hidden sm:block">
          Welcome back, {profileData.name || user?.name}
        </h2>
        <h2 className="text-sm font-semibold text-foreground sm:hidden">
          {(profileData.name || user?.name || '').split(' ')[0]}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 p-0"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-8 w-8 p-0"
          onClick={() => navigate('/dashboard')}
        >
          <Bell className="h-4 w-4" />
          {unreadAlerts > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadAlerts}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(profileData.name || user?.name || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profileData.name || user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profileData.email || user?.email}
                </p>
                {(profileData.barNumber || user?.barNumber) && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Bar No: {profileData.barNumber || user?.barNumber}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};