import { Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto text-center py-20 px-4">
      {/* Logo and Branding */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Box className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Open E-Label</h1>
        <p className="text-lg text-gray-600 mb-8">Open-source solution for electronic labels.</p>
      </div>
      
      {/* Call to Action */}
      <Button 
        onClick={() => setLocation('/login')}
        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
        size="lg"
      >
        <Box className="w-5 h-5 mr-2" />
        Administration Dashboard
      </Button>
      
      {/* Footer */}
      <div className="mt-20 text-sm text-gray-500">
        <p>Electronic label provided by Open E-Label. Web Accessibility Guidelines.</p>
      </div>
    </div>
  );
}
