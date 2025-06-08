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

const productFormSchema = insertProductSchema;
type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      brand: product.brand || undefined,
      netVolume: product.netVolume || undefined,
      vintage: product.vintage || undefined,
      wineType: product.wineType || undefined,
      sugarContent: product.sugarContent || undefined,
      appellation: product.appellation || undefined,
      alcoholContent: product.alcoholContent || undefined,
      countryOfOrigin: product.countryOfOrigin || undefined,
      sku: product.sku || undefined,
      ean: product.ean || undefined,
      packagingGases: product.packagingGases || undefined,
      portionSize: product.portionSize || undefined,
      kcal: product.kcal || undefined,
      kj: product.kj || undefined,
      fat: product.fat || undefined,
      carbohydrates: product.carbohydrates || undefined,
      organic: product.organic || false,
      vegetarian: product.vegetarian || false,
      vegan: product.vegan || false,
      operatorType: product.operatorType || undefined,
      operatorName: product.operatorName || undefined,
      operatorAddress: product.operatorAddress || undefined,
      operatorInfo: product.operatorInfo || undefined,
      externalLink: product.externalLink || undefined,
      redirectLink: product.redirectLink || undefined,
      createdBy: product.createdBy || undefined,
    } : {
      name: '',
      organic: false,
      vegetarian: false,
      vegan: false,
    },
  });

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  name="netVolume"
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
                  name="wineType"
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
                  name="sugarContent"
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
                        <Input {...field} placeholder="e.g. Bordeaux AOC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alcoholContent"
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
                  name="countryOfOrigin"
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
                name="packagingGases"
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
                  name="portionSize"
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
                        <Input {...field} placeholder="e.g. 85" />
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
                        <Input {...field} placeholder="e.g. 356" />
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
                      <FormLabel>Fat</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 0g" />
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
                      <FormLabel>Carbohydrates</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 2.6g" />
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
                  name="operatorType"
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
                  name="operatorName"
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
                name="operatorAddress"
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
                name="operatorInfo"
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
                  name="externalLink"
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
                  name="redirectLink"
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