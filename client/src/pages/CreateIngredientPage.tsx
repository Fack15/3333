import { useLocation } from 'wouter';
import IngredientForm from '@/components/forms/IngredientForm';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertIngredient, Ingredient } from '@shared/schema';

export default function CreateIngredientPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIngredientMutation = useMutation({
    mutationFn: (data: InsertIngredient) => {
      console.log('Submitting ingredient data:', JSON.stringify(data, null, 2));
      return apiRequest('/api/ingredients', { method: 'POST', data });
    },
    onSuccess: (newIngredient: Ingredient) => {
      console.log('Successfully created ingredient:', JSON.stringify(newIngredient, null, 2));
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      toast({
        title: "Ingredient created successfully!",
        description: `${newIngredient.name} has been added to your ingredients database.`,
      });
      setLocation('/ingredients');
    },
    onError: (error: any) => {
      console.error('Error creating ingredient:', error);
      toast({
        title: "Error creating ingredient",
        description: error?.details?.message || error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: InsertIngredient) => {
    createIngredientMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation('/ingredients');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ingredient</h1>
        <p className="text-gray-600">Add a new ingredient to your database</p>
      </div>
      
      <IngredientForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createIngredientMutation.isPending}
      />
    </div>
  );
}
