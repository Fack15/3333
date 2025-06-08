import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      toast({
        title: "Authentication required",
        description: "Please login to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, setLocation, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
