import { useLocation } from 'wouter';
import ProductForm from '@/components/forms/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertProduct } from '@shared/schema';

export default function CreateProductPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest('/api/products', { method: 'POST', data }),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product created successfully!",
        description: `${newProduct.name} has been added to your inventory.`,
      });
      setLocation('/products');
    },
    onError: (error: any) => {
      console.error('Product creation error:', error);
      let errorMessage = "Please try again.";
      if (error?.message) {
        try {
          const parsed = JSON.parse(error.message.split(': ')[1]);
          if (parsed.details) {
            errorMessage = parsed.details.map((err: any) => 
              `${err.field}: ${err.message}`
            ).join('\n');
          }
        } catch (e) {
          errorMessage = error.message;
        }
      }
      toast({
        title: "Error creating product",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: InsertProduct) => {
    // Clean up the data by removing undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as InsertProduct;
    
    createProductMutation.mutate(cleanData);
  };

  const handleCancel = () => {
    setLocation('/products');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
        <p className="text-gray-600">Add a new wine product to your inventory</p>
      </div>
      
      <ProductForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createProductMutation.isPending}
      />
    </div>
  );
}
