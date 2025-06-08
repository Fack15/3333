import { useLocation } from 'wouter';
import { Box, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    setLocation('/');
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
  };

  const navItems = [
    { label: 'Home', path: '/', id: 'landing' },
    { label: 'Products', path: '/products', id: 'products', protected: true },
    { label: 'Ingredients', path: '/ingredients', id: 'ingredients', protected: true },
  ];

  const handleNavClick = (path: string, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      setLocation('/login');
      toast({
        title: "Authentication required",
        description: "Please login to access this page.",
        variant: "destructive",
      });
      return;
    }
    setLocation(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Elabel</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path, item.protected || false)}
                className={`text-gray-600 hover:text-primary transition-colors ${
                  location === item.path ? 'text-primary font-semibold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {user?.id}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/login')}
                className="text-gray-600 hover:text-primary"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
