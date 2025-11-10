import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getApiUrl } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'lawyer' | 'assistant' | 'admin';
  barNumber?: string;
  firm?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  barNumber?: string;
  firm?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Helper function to clear all authentication data
  const clearAuthData = useCallback(() => {
    setUser(null);
    localStorage.removeItem('legal_pro_user');
    // Clear cookies with all possible configurations
    const cookieOptions = [
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';',
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname + ';',
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;',
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax;',
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict;',
    ];
    cookieOptions.forEach(options => {
      document.cookie = options;
    });
  }, []);

  // Check authentication status on mount and when path changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip auto-login if we're on login/signup pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/signup' || 
                        currentPath === '/forgot-password' || currentPath === '/reset-password';
      
      // CRITICAL: If on auth page, NEVER auto-login - always show login form
      if (isAuthPage) {
        setUser(null);
        setIsLoading(false);
        setHasCheckedAuth(true);
        return;
      }
      
      // Check if user explicitly logged out (session invalidation flag)
      const sessionInvalidated = sessionStorage.getItem('auth_session_invalidated');
      
      try {
        // If session was explicitly invalidated, don't auto-login
        if (sessionInvalidated) {
          clearAuthData();
          sessionStorage.removeItem('auth_session_invalidated');
          setIsLoading(false);
          setHasCheckedAuth(true);
          return;
        }

        // Check if we have a stored user and verify it with the server
        const storedUser = localStorage.getItem('legal_pro_user');
        if (storedUser) {
          // Verify the stored user with the server
          const res = await fetch(getApiUrl('/api/auth/me'), { 
            credentials: 'include',
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('legal_pro_user', JSON.stringify(data.user));
          } else {
            // Server says we're not authenticated, clear everything
            clearAuthData();
          }
        } else {
          // No stored user, check if server has a valid session (cookie-based)
          const res = await fetch(getApiUrl('/api/auth/me'), { 
            credentials: 'include',
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('legal_pro_user', JSON.stringify(data.user));
          } else {
            setUser(null);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    };

    // Check auth on initial mount
    if (!hasCheckedAuth) {
      checkAuthStatus();
    }
  }, [hasCheckedAuth, clearAuthData]);


  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Clear any session invalidation flag on new login
      sessionStorage.removeItem('auth_session_invalidated');
      
      // Normalize email (trim and lowercase) but preserve password as-is (passwords can contain spaces)
      const normalizedEmail = email.trim().toLowerCase();
      
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        setIsLoading(false);
        return { success: false, error: errorData.error || 'Invalid credentials' };
      }
      
      const data = await res.json();
      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        barNumber: data.user.barNumber,
        firm: data.user.firm,
      };
      
      // Set new user and update storage
      setUser(newUser);
      localStorage.setItem('legal_pro_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        barNumber: data.user.barNumber,
        firm: data.user.firm,
      };
      
      setUser(newUser);
      localStorage.setItem('legal_pro_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      // Set session invalidation flag to prevent auto-login
      sessionStorage.setItem('auth_session_invalidated', 'true');
      
      // Call logout endpoint
      await fetch(getApiUrl('/api/auth/logout'), { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local state regardless of server response
      clearAuthData();
      // Set session invalidation flag
      sessionStorage.setItem('auth_session_invalidated', 'true');
      // Navigate to login page
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};