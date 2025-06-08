import { useLocation } from 'wouter';
import { useParams } from 'wouter';
import IngredientForm from '@/components/forms/IngredientForm';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Ingredient, InsertIngredient } from '@shared/schema';

export default function EditIngredientPage() {
  const params = useParams();
  const ingredientId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ingredient, isLoading: isLoadingIngredient } = useQuery({
    queryKey: ['/api/ingredients', ingredientId],
    queryFn: async () => {
      const response = await fetch(`/api/ingredients/${ingredientId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch ingredient');
      }
      return response.json() as Promise<Ingredient>;
    },
    enabled: !!ingredientId,
  });

  const updateIngredientMutation = useMutation({
    mutationFn: async (data: InsertIngredient) => {
      console.log('Updating ingredient with data:', JSON.stringify(data, null, 2));
      const response = await apiRequest(`/api/ingredients/${ingredientId}`, {
        method: 'PUT',
        data,
      });
      if (!response) throw new Error('Failed to update ingredient');
      return response as Ingredient;
    },
    onSuccess: (updatedIngredient) => {
      console.log('Successfully updated ingredient:', JSON.stringify(updatedIngredient, null, 2));
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients', ingredientId] });
      toast({
        title: "Success!",
        description: `${updatedIngredient.name} has been updated successfully.`,
        duration: 3000,
      });
      setLocation('/ingredients');
    },
    onError: (error: any) => {
      console.error('Error updating ingredient:', error);
      toast({
        title: "Error updating ingredient",
        description: error?.details?.message || error?.message || "Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = async (data: InsertIngredient) => {
    try {
      console.log('Form submitted with data:', JSON.stringify(data, null, 2));
      updateIngredientMutation.mutate(data);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to process the update. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    setLocation('/ingredients');
  };

  if (isLoadingIngredient) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading ingredient data...</div>
        </div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg text-red-600">Ingredient not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Ingredient</h1>
      <IngredientForm
        ingredient={ingredient}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateIngredientMutation.isPending}
      />
    </div>
  );
}