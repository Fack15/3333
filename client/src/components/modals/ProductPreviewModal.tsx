import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@shared/schema';

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, isOpen, onClose }: ProductPreviewModalProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image */}
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">No Image Available</span>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Brand</h3>
              <p className="text-gray-600">{product.brand || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Net Volume</h3>
              <p className="text-gray-600">{product.net_volume || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Vintage</h3>
              <p className="text-gray-600">{product.vintage || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Wine Type</h3>
              <p className="text-gray-600">{product.wine_type || 'Not specified'}</p>
            </div>
          </div>

          <Separator />

          {/* Nutrition Declaration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nutrition Declaration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Energy</h4>
                <p className="text-sm text-gray-600">
                  {product.kcal ? `${product.kcal} kcal` : 'Not specified'} 
                  {product.kj && ` / ${product.kj} kJ`}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fat</h4>
                <p className="text-sm text-gray-600">{product.fat || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Carbohydrates</h4>
                <p className="text-sm text-gray-600">{product.carbohydrates || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sugar Content</h4>
                <p className="text-sm text-gray-600">{product.sugar_content || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Alcohol Content</h4>
                <p className="text-sm text-gray-600">{product.alcohol_content || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Portion Size</h4>
                <p className="text-sm text-gray-600">{product.portion_size || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Certifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {product.organic && <Badge variant="secondary">Organic</Badge>}
              {product.vegetarian && <Badge variant="secondary">Vegetarian</Badge>}
              {product.vegan && <Badge variant="secondary">Vegan</Badge>}
              {!product.organic && !product.vegetarian && !product.vegan && (
                <span className="text-gray-500">No certifications specified</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Food Business Operator Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Food Business Operator (FBO) Details</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Operator Type</h4>
                <p className="text-sm text-gray-600">{product.operator_type || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium">Operator Name</h4>
                <p className="text-sm text-gray-600">{product.operator_name || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-sm text-gray-600">{product.operator_address || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium">Additional Info</h4>
                <p className="text-sm text-gray-600">{product.operator_info || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Country of Origin</h4>
                <p className="text-sm text-gray-600">{product.country_of_origin || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Appellation</h4>
                <p className="text-sm text-gray-600">{product.appellation || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">SKU</h4>
                <p className="text-sm text-gray-600">{product.sku || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">EAN</h4>
                <p className="text-sm text-gray-600">{product.ean || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Packaging Gases</h4>
                <p className="text-sm text-gray-600">{product.packaging_gases || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}