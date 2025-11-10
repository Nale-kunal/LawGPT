import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Clear user state when Login component mounts to prevent auto-login from stale sessions
  // This ensures that even if AuthContext restored a user, we clear it on the login page
  useEffect(() => {
    // Import the auth context directly to clear user state
    // This prevents any auto-login when user explicitly visits login page
    const storedUser = localStorage.getItem('legal_pro_user');
    if (storedUser) {
      // Don't remove from localStorage yet, but ensure AuthContext knows we're on login page
      // The AuthContext check on mount should handle this, but we'll be extra safe
      sessionStorage.setItem('auth_session_invalidated', 'true');
    }
  }, []);

  // Redirect to dashboard only after successful login (not from stale sessions)
  // The AuthContext will not auto-login when on /login page, so this should only
  // trigger after a successful login() call
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Clear the session invalidation flag since user successfully logged in
      sessionStorage.removeItem('auth_session_invalidated');
      // User is authenticated - redirect to dashboard
      // This happens after successful login, not from stale sessions
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen legal-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to LegalPro!",
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen legal-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-professional">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">LegalPro</CardTitle>
          <CardDescription>
            Professional Legal Case Management System for Indian Law Firms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="advocate@lawfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
            </div>
            <div>
              Don't have an account? <a href="/signup" className="text-primary hover:underline font-medium">Sign up</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;