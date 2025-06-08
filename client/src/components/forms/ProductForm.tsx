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
import { wineTypeOptions, operatorTypeOptions } from '@/lib/mock-data';
import { insertProductSchema } from '@shared/schema';
import type { Product } from '@shared/schema';

// Use the schema directly since we've already defined it properly in shared/schema.ts
type ProductFormData = z.infer<typeof insertProductSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper function to transform empty string to null
const transformEmptyToNull = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null || value.trim() === '') return null;
  return value.trim();
};

// Helper function to transform string to integer or null
const transformToIntegerOrNull = (value: string | number | null | undefined): number | null => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(num) ? null : num;
};

export default function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name?.trim() || '',
      brand: transformEmptyToNull(product?.brand) || null,
      net_volume: transformEmptyToNull(product?.net_volume) || null,
      vintage: transformEmptyToNull(product?.vintage) || null,
      wine_type: transformEmptyToNull(product?.wine_type) || null,
      sugar_content: transformEmptyToNull(product?.sugar_content) || null,
      appellation: transformEmptyToNull(product?.appellation) || null,
      alcohol_content: transformEmptyToNull(product?.alcohol_content) || null,
      country_of_origin: transformEmptyToNull(product?.country_of_origin) || null,
      sku: transformEmptyToNull(product?.sku) || null,
      ean: transformEmptyToNull(product?.ean) || null,
      packaging_gases: transformEmptyToNull(product?.packaging_gases) || null,
      portion_size: transformEmptyToNull(product?.portion_size) || null,
      // All fields as strings
      kcal: product?.kcal || null,
      kj: product?.kj || null,
      fat: product?.fat || null,
      carbohydrates: product?.carbohydrates || null,
      organic: product?.organic ?? false,
      vegetarian: product?.vegetarian ?? false,
      vegan: product?.vegan ?? false,
      operator_type: transformEmptyToNull(product?.operator_type) || null,
      operator_name: transformEmptyToNull(product?.operator_name) || null,
      operator_address: transformEmptyToNull(product?.operator_address) || null,
      operator_info: transformEmptyToNull(product?.operator_info) || null,
      external_link: transformEmptyToNull(product?.external_link) || null,
      redirect_link: transformEmptyToNull(product?.redirect_link) || null,
      image_url: product?.image_url || null,
      created_by: product?.created_by || null
    }
  });

  const handleFormSubmit = (data: ProductFormData) => {
    // Transform the data to match the schema expectations
    const transformedData = {
      ...data,
      name: data.name.trim(),
      brand: transformEmptyToNull(data.brand),
      net_volume: transformEmptyToNull(data.net_volume),
      vintage: transformEmptyToNull(data.vintage),
      wine_type: transformEmptyToNull(data.wine_type),
      sugar_content: transformEmptyToNull(data.sugar_content),
      appellation: transformEmptyToNull(data.appellation),
      alcohol_content: transformEmptyToNull(data.alcohol_content),
      country_of_origin: transformEmptyToNull(data.country_of_origin),
      sku: transformEmptyToNull(data.sku),
      ean: transformEmptyToNull(data.ean),
      packaging_gases: transformEmptyToNull(data.packaging_gases),
      portion_size: transformEmptyToNull(data.portion_size),
      operator_type: transformEmptyToNull(data.operator_type),
      operator_name: transformEmptyToNull(data.operator_name),
      operator_address: transformEmptyToNull(data.operator_address),
      operator_info: transformEmptyToNull(data.operator_info),
      external_link: transformEmptyToNull(data.external_link),
      redirect_link: transformEmptyToNull(data.redirect_link),
      organic: data.organic ?? false,
      vegetarian: data.vegetarian ?? false,
      vegan: data.vegan ?? false,
      image_url: data.image_url,
      created_by: data.created_by
    };

    // Log the transformed data before submission
    console.log('Submitting form data:', transformedData);
    onSubmit(transformedData);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Chateau Margaux" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Margaux Estate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="net_volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Volume</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 750ml" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. WIN-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ean"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EAN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 1234567890123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Wine Details */}
          <Card>
            <CardHeader>
              <CardTitle>Wine Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vintage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vintage</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 2019" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wine_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wine Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wine type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wineTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="sugar_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar Content</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Dry, Brut" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appellation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appellation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Bordeaux" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alcohol_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol Content</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 13.5%" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country_of_origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. France" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          <Card>
            <CardHeader>
              <CardTitle>Packaging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="packaging_gases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging Gases</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Nitrogen, Carbon dioxide" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Nutrition Information */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="portion_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portion Size</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 100ml" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text" 
                          placeholder="e.g. 120"
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy (kJ)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text" 
                          placeholder="e.g. 502"
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text" 
                          placeholder="e.g. 5"
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbohydrates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text" 
                          placeholder="e.g. 25"
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="organic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Organic</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegetarian</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vegan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegan</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Food Business Operator */}
          <Card>
            <CardHeader>
              <CardTitle>Food Business Operator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="operator_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {operatorTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="operator_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Wine Company Ltd." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="operator_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Full business address..." className="h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operator_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Operator Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional business information..." className="h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Portability */}
          <Card>
            <CardHeader>
              <CardTitle>Portability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="external_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://example.com/product" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redirect_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect Link</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://redirect.com/product" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}