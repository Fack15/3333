import { createClient } from '@supabase/supabase-js';
import { users, products, ingredients, type User, type InsertUser, type Product, type InsertProduct, type Ingredient, type InsertIngredient } from "@shared/schema";
import fs from 'fs';
import path from 'path';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is not set');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('SUPABASE_KEY environment variable is not set');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Initializing Supabase client...');
// Regular client for normal operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Verify database connection
async function verifyDatabaseConnection() {
  try {
    console.log('Verifying database connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .single();

    if (error) {
      console.error('Database connection error:', error);
      throw error;
    }

    console.log('Database connection successful. Products count:', data?.count);
  } catch (error) {
    console.error('Failed to verify database connection:', error);
    throw error;
  }
}

// Call verification
verifyDatabaseConnection();

// Initialize storage bucket
async function initializeStorage() {
  try {
    console.log('Checking if product-images bucket exists...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-images');
    
    if (!bucketExists) {
      console.log('Creating product-images bucket...');
      const { data, error: createError } = await supabaseAdmin.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        // Don't throw error, just log it - the app can still work without image upload
        console.log('Image upload will be disabled until bucket is created');
      } else {
        console.log('Successfully created product-images bucket');
        
        // Create RLS policies for the bucket
        const createPolicies = async () => {
          try {
            // Policy for public read access
            await supabase.rpc('create_storage_policy', {
              bucket_name: 'product-images',
              policy_name: 'Public Read Access',
              definition: `bucket_id = 'product-images'`,
              policy_type: 'SELECT'
            });

            // Policy for authenticated write access
            await supabase.rpc('create_storage_policy', {
              bucket_name: 'product-images',
              policy_name: 'Authenticated Write Access',
              definition: `bucket_id = 'product-images'`,
              policy_type: 'INSERT'
            });

            console.log('Storage policies created successfully');
          } catch (error) {
            console.error('Error creating storage policies:', error);
          }
        };

        await createPolicies();
      }
    } else {
      console.log('product-images bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Call initialization
initializeStorage();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByConfirmationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  uploadProductImage(productId: number, imagePath: string): Promise<string>;
  
  // Ingredient methods
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined>;
  deleteIngredient(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();
    return data;
  }

  async getUserByConfirmationToken(token: string): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select()
      .eq('email_confirmation_token', token)
      .single();
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return data;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      console.log('Fetching all products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} products`);
      return data || [];
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log('Fetching product with ID:', id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      if (!data) {
        console.log('No product found with ID:', id);
        return undefined;
      }

      console.log('Found product:', data);
      return data;
    } catch (error) {
      console.error('Error in getProduct:', error);
      throw error;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    console.log('Updating product with data:', JSON.stringify(product, null, 2));
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    console.log('Product updated successfully:', JSON.stringify(data, null, 2));
    return data;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return !error;
  }

  async uploadProductImage(productId: number, imagePath: string): Promise<string> {
    try {
      console.log('Reading file from path:', imagePath);
      // Read the file
      const fileBuffer = fs.readFileSync(imagePath);
      const fileExt = path.extname(imagePath);
      // Create a folder structure: products/{productId}/image_{timestamp}.ext
      const fileName = `products/${productId}/image_${Date.now()}${fileExt}`;
      console.log('Generated file name:', fileName);

      console.log('Uploading to Supabase storage...');
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/*',
          upsert: true
        });

      if (error) {
        console.error('Supabase storage error:', {
          message: error.message,
          name: error.name
        });
        throw error;
      }

      console.log('Upload successful, getting public URL...');
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Update the product with the image URL
      console.log('Updating product with image URL...');
      await this.updateProduct(productId, { image_url: publicUrl });
      console.log('Product updated successfully');

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      throw error;
    } finally {
      // Clean up the temporary file
      try {
        console.log('Cleaning up temporary file:', imagePath);
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }
    }
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    const { data } = await supabase
      .from('ingredients')
      .select()
      .order('name');
    return data || [];
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    const { data } = await supabase
      .from('ingredients')
      .select()
      .eq('id', id)
      .single();
    return data;
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    console.log('Creating ingredient with data:', JSON.stringify(ingredient, null, 2));
    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredient)
      .select()
      .single();
    if (error) {
      console.error('Error creating ingredient in database:', error);
      throw error;
    }
    console.log('Ingredient created in database:', JSON.stringify(data, null, 2));
    return data;
  }

  async updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined> {
    try {
      console.log('Updating ingredient in database:', { id, data: ingredient });
      
      // Ensure all fields are properly formatted
      const updateData = {
        name: ingredient.name.trim(),
        category: ingredient.category?.trim() || null,
        e_number: ingredient.e_number?.trim() || null,
        allergens: Array.isArray(ingredient.allergens) ? ingredient.allergens.map((a: string) => a.trim()) : [],
        details: ingredient.details?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      console.log('Formatted update data:', JSON.stringify(updateData, null, 2));

      const { data, error } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating ingredient in database:', error);
        throw error;
      }

      console.log('Successfully updated ingredient:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error in updateIngredient:', error);
      throw error;
    }
  }

  async deleteIngredient(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);
    return !error;
  }
}

export const storage = new DatabaseStorage();
