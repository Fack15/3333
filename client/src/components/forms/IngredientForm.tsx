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
import type { Ingredient } from '@shared/schema';

const ingredientFormSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  category: z.string().optional(),
  eNumber: z.string().optional(),
  details: z.string().optional(),
  allergens: z.array(z.string()).default([]),
});

type IngredientFormData = z.infer<typeof ingredientFormSchema>;

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSubmit: (data: IngredientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function IngredientForm({ ingredient, onSubmit, onCancel, isLoading = false }: IngredientFormProps) {
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: ingredient ? {
      name: ingredient.name,
      category: ingredient.category || '',
      eNumber: ingredient.eNumber || '',
      details: ingredient.details || '',
      allergens: ingredient.allergens || [],
    } : {
      name: '',
      category: '',
      eNumber: '',
      details: '',
      allergens: [],
    },
  });

  const allergens = form.watch('allergens');

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    if (checked) {
      form.setValue('allergens', [...allergens, allergen]);
    } else {
      form.setValue('allergens', allergens.filter(a => a !== allergen));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Ingredient Information */}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="eNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. E220" />
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
                    <Textarea {...field} placeholder="Additional details about the ingredient..." className="h-24" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Allergens */}
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
                    checked={allergens.includes(allergen)}
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90">
            {isLoading ? 'Saving...' : ingredient ? 'Update Ingredient' : 'Save Ingredient'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
