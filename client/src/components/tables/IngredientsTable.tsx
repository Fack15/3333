import { Edit, MoreVertical, Copy, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Ingredient } from '@shared/schema';

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onEdit?: (ingredient: Ingredient) => void;
  onDelete?: (ingredient: Ingredient) => void;
  onDuplicate?: (ingredient: Ingredient) => void;
}

export default function IngredientsTable({ ingredients, onEdit, onDelete, onDuplicate }: IngredientsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</TableHead>
            <TableHead className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Category</TableHead>
            <TableHead className="text-left px-6 py-4 text-sm font-semibold text-gray-900">E Number</TableHead>
            <TableHead className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Allergens</TableHead>
            <TableHead className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="px-6 py-4">
                <div className="font-medium text-gray-900">{ingredient.name}</div>
              </TableCell>
              <TableCell className="px-6 py-4 text-gray-600">{ingredient.category || '-'}</TableCell>
              <TableCell className="px-6 py-4 text-gray-600">{ingredient.eNumber || '-'}</TableCell>
              <TableCell className="px-6 py-4">
                {ingredient.allergens && ingredient.allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {ingredient.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(ingredient)}
                    className="text-gray-600 hover:text-primary p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-primary p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit?.(ingredient)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate?.(ingredient)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(ingredient)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
