import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryOptions, allergenOptions } from '@/lib/mock-data';
import { insertIngredientSchema } from '@shared/schema';
import type { Ingredient } from '@shared/schema';

type IngredientFormData = z.infer<typeof insertIngredientSchema>;

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSubmit: (data: IngredientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function IngredientForm({ ingredient, onSubmit, onCancel, isLoading = false }: IngredientFormProps) {
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(insertIngredientSchema),
    defaultValues: {
      name: '',
      category: '',
      e_number: '',
      details: '',
      allergens: [],
    },
  });

  // Update form values when ingredient data changes
  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name,
        category: ingredient.category || '',
        e_number: ingredient.e_number || '',
        details: ingredient.details || '',
        allergens: ingredient.allergens || [],
      });
    }
  }, [ingredient, form]);

  const handleFormSubmit = async (data: IngredientFormData) => {
    try {
      // Transform empty strings to null and ensure allergens is an array
      const transformedData = {
        name: data.name.trim(),
        category: data.category?.trim() || null,
        e_number: data.e_number?.trim() || null,
        details: data.details?.trim() || null,
        allergens: Array.isArray(data.allergens) ? data.allergens.map(a => a.trim()) : [],
      };

      // Log the data being submitted
      console.log('Form data before transformation:', data);
      console.log('Transformed data:', transformedData);

      await onSubmit(transformedData);
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error; // Let the parent component handle the error
    }
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    const currentAllergens = form.getValues('allergens') || [];
    const newAllergens = checked
      ? [...new Set([...currentAllergens, allergen])]
      : currentAllergens.filter(a => a !== allergen);
    
    form.setValue('allergens', newAllergens, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingredient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter ingredient name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="e_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g. E220" 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Ingredient Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional details about the ingredient..." 
                      className="h-24"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {allergenOptions.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergen}
                    checked={form.watch('allergens')?.includes(allergen) || false}
                    onCheckedChange={(checked) => handleAllergenChange(allergen, checked as boolean)}
                  />
                  <label
                    htmlFor={allergen}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {allergen}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-accent hover:bg-accent/90"
          >
            {isLoading ? 'Saving...' : ingredient ? 'Update Ingredient' : 'Save Ingredient'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 