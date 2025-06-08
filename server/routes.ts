import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProductSchema,
  insertIngredientSchema,
  loginSchema,
  registerSchema,
  stringOrNull,
} from "@shared/schema";
import { AuthService } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import { z } from "zod";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for Excel file uploads
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    console.log('Uploaded file mimetype:', file.mimetype);
    console.log('Original filename:', file.originalname);
    
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain',
      'application/csv',
      'application/octet-stream' // Allow this and check file extension
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Not an Excel/CSV file! Received: ${file.mimetype} with extension ${fileExtension}. Please upload only Excel or CSV files.`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Configuration endpoint
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    });
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Hardcoded registration - accept any credentials
      const mockUser = {
        id: Math.floor(Math.random() * 1000) + 1,
        username: username || "demo_user",
        email: email || "demo@example.com",
        isEmailConfirmed: true
      };

      const mockToken = "demo_token_" + Date.now();

      res.status(201).json({
        success: true,
        user: mockUser,
        token: mockToken,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration route error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Hardcoded login - accept any email/password combination
      const mockUser = {
        id: 1,
        username: "demo_user",
        email: email || "demo@example.com",
        isEmailConfirmed: true
      };

      const mockToken = "demo_token_" + Date.now();

      res.json({
        success: true,
        user: mockUser,
        token: mockToken,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login route error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.get("/api/auth/confirm-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is required" });
      }

      const authResult = await AuthService.confirmEmail(token);

      if (authResult.success) {
        // Redirect to login page with success message
        res.redirect("/?emailConfirmed=true");
      } else {
        res.redirect(
          "/?emailConfirmed=false&error=" +
            encodeURIComponent(
              authResult.message || "Email confirmation failed",
            ),
        );
      }
    } catch (error) {
      console.error("Email confirmation route error:", error);
      res.redirect("/?emailConfirmed=false&error=confirmation_failed");
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('Received request for all products');
      const products = await storage.getProducts();
      console.log(`Sending ${products.length} products to client`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Product image upload route
  app.post("/api/products/:id/image", upload.single('image'), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const file = req.file;

      console.log('Received image upload request for product:', productId);
      console.log('File details:', file);

      if (!file) {
        console.error('No file provided in request');
        return res.status(400).json({ error: "No image file provided" });
      }

      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        console.error('Product not found:', productId);
        return res.status(404).json({ error: "Product not found" });
      }

      console.log('Uploading image to Supabase storage...');
      // Upload image to Supabase storage and update product
      const imageUrl = await storage.uploadProductImage(productId, file.path);
      console.log('Image uploaded successfully. URL:', imageUrl);

      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error('Error handling image upload:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update product image" });
    }
  });

  // Export route must come before /:id route
  app.get("/api/products/export", async (req, res) => {
    try {
      console.log("Starting products export...");
      const products = await storage.getProducts();
      console.log(`Found ${products.length} products to export`);
      
      // Transform products for Excel export - specific fields only
      const exportData = products.map(product => ({
        Name: product.name,
        'Net Volume': product.netVolume,
        Vintage: product.vintage,
        Type: product.wineType,
        'Sugar Content': product.sugarContent,
        Appellation: product.appellation,
        SKU: product.sku
      }));

      console.log("Creating Excel worksheet...");
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      console.log("Generating Excel buffer...");
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      console.log(`Buffer size: ${buffer.length} bytes`);

      res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
      console.log("Export completed successfully");
    } catch (error: any) {
      console.error("Export error details:", error);
      res.status(500).json({ error: "Failed to export products", details: error?.message || String(error) });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Received request for product ID:', id);

      if (isNaN(id)) {
        console.error('Invalid product ID:', req.params.id);
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const product = await storage.getProduct(id);
      
      if (!product) {
        console.log('Product not found:', id);
        return res.status(404).json({ error: "Product not found" });
      }

      console.log('Successfully retrieved product:', id);
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      console.log('Received product data:', JSON.stringify(req.body, null, 2));
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        const errorDetails = {
          errors: errors.map(err => ({
            path: err.path,
            code: err.code,
            message: err.message,
            received: err.received,
            expected: err.expected,
            fatal: err.fatal
          })),
          receivedData: req.body,
          formattedError: validationResult.error.format()
        };
        console.error('Validation failed. Full error details:', JSON.stringify(errorDetails, null, 2));
        return res.status(400).json({
          error: "Invalid product data",
          details: errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
            code: err.code,
            expected: err.expected
          }))
        });
      }

      console.log('Validation successful. Creating product:', JSON.stringify(validationResult.data, null, 2));
      const product = await storage.createProduct(validationResult.data);
      console.log('Product created successfully:', JSON.stringify(product, null, 2));
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: "Failed to create product", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Received update data:', JSON.stringify(req.body, null, 2));
      
      // Create a partial schema that makes all fields optional
      const partialProductSchema = z.object({
        name: z.string().trim().min(1, "Name is required").optional(),
        brand: stringOrNull.optional(),
        net_volume: stringOrNull.optional(),
        vintage: stringOrNull.optional(),
        wine_type: stringOrNull.optional(),
        sugar_content: stringOrNull.optional(),
        appellation: stringOrNull.optional(),
        alcohol_content: stringOrNull.optional(),
        packaging_gases: stringOrNull.optional(),
        portion_size: stringOrNull.optional(),
        kcal: stringOrNull.optional(),
        kj: stringOrNull.optional(),
        fat: stringOrNull.optional(),
        carbohydrates: stringOrNull.optional(),
        organic: z.boolean().optional(),
        vegetarian: z.boolean().optional(),
        vegan: z.boolean().optional(),
        operator_type: stringOrNull.optional(),
        operator_name: stringOrNull.optional(),
        operator_address: stringOrNull.optional(),
        operator_info: stringOrNull.optional(),
        country_of_origin: stringOrNull.optional(),
        sku: stringOrNull.optional(),
        ean: stringOrNull.optional(),
        external_link: stringOrNull.optional(),
        redirect_link: stringOrNull.optional(),
        image_url: stringOrNull.optional(),
        created_by: z.number().nullable().optional()
      }).transform(data => {
        // Transform all string fields to ensure they are properly handled
        const transformedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            // Handle string fields
            if (typeof value === 'string') {
              const trimmed = value.trim();
              return [key, trimmed || null];
            }
            // Handle undefined values
            if (value === undefined) {
              return [key, null];
            }
            return [key, value];
          })
        );
        console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
        return transformedData;
      });

      const validationResult = partialProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        console.error('Validation failed:', JSON.stringify(errors, null, 2));
        return res.status(400).json({
          error: "Invalid product data",
          details: errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
            code: err.code
          }))
        });
      }

      console.log('Validation successful. Updating product:', JSON.stringify(validationResult.data, null, 2));
      const product = await storage.updateProduct(id, validationResult.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      console.log('Product updated successfully:', JSON.stringify(product, null, 2));
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({ error: "Invalid product data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Image upload routes
  app.delete("/api/products/:id/image", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product.imageUrl) {
        // Delete the image file from disk
        const imagePath = path.join(process.cwd(), product.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Remove image URL from product
      const updatedProduct = await storage.updateProduct(id, { imageUrl: null });
      
      if (!updatedProduct) {
        return res.status(500).json({ error: "Failed to update product" });
      }

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Image delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Ingredients routes
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  // Export route must come before the parameterized route
  app.get("/api/ingredients/export", async (req, res) => {
    try {
      console.log("Starting ingredients export...");
      const ingredients = await storage.getIngredients();
      console.log(`Found ${ingredients.length} ingredients to export`);
      
      // Transform ingredients for Excel export
      const exportData = ingredients.map(ingredient => ({
        Name: ingredient.name,
        Category: ingredient.category,
        'E Number': ingredient.eNumber,
        Allergens: Array.isArray(ingredient.allergens) ? ingredient.allergens.join(', ') : ingredient.allergens,
        Details: ingredient.details
      }));

      console.log("Creating Excel worksheet...");
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingredients');

      console.log("Generating Excel buffer...");
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      console.log(`Buffer size: ${buffer.length} bytes`);

      res.setHeader('Content-Disposition', 'attachment; filename=ingredients.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
      console.log("Export completed successfully");
    } catch (error: any) {
      console.error("Export error details:", error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ error: "Failed to export ingredients", details: error?.message || String(error) });
    }
  });

  app.get("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ingredient = await storage.getIngredient(id);
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredient" });
    }
  });

  app.post("/api/ingredients", async (req, res) => {
    try {
      console.log('Received ingredient data:', JSON.stringify(req.body, null, 2));
      const validatedData = insertIngredientSchema.parse(req.body);
      console.log('Validated ingredient data:', JSON.stringify(validatedData, null, 2));
      const ingredient = await storage.createIngredient(validatedData);
      console.log('Created ingredient:', JSON.stringify(ingredient, null, 2));
      res.status(201).json(ingredient);
    } catch (error) {
      console.error("Error creating ingredient:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid ingredient data",
          details: {
            message: "Validation failed",
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        });
      } else {
        res.status(500).json({
          error: "Failed to create ingredient",
          details: {
            message: error instanceof Error ? error.message : "Unknown error occurred"
          }
        });
      }
    }
  });

  app.put("/api/ingredients/:id", async (req, res) => {
    try {
      console.log('Updating ingredient with data:', JSON.stringify(req.body, null, 2));
      const id = parseInt(req.params.id);
      
      // First check if the ingredient exists
      const existingIngredient = await storage.getIngredient(id);
      if (!existingIngredient) {
        return res.status(404).json({ 
          error: "Ingredient not found",
          details: { message: `No ingredient found with id ${id}` }
        });
      }

      // Create a partial schema for updates
      const partialIngredientSchema = z.object({
        name: z.string().trim().min(1, "Name is required").optional(),
        category: stringOrNull.optional(),
        e_number: z.string().trim().transform(str => str || null).nullable().optional(),
        allergens: z.array(z.string()).optional(),
        details: stringOrNull.optional(),
        created_by: z.number().nullable().optional()
      }).transform(data => {
        // Transform all string fields to ensure they are properly handled
        const transformedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            // Handle string fields
            if (typeof value === 'string') {
              const trimmed = value.trim();
              return [key, trimmed || null];
            }
            // Handle undefined values
            if (value === undefined) {
              return [key, null];
            }
            return [key, value];
          })
        );
        return transformedData;
      });

      // Validate the update data
      const validationResult = partialIngredientSchema.safeParse({
        ...req.body,
        allergens: Array.isArray(req.body.allergens) ? req.body.allergens : [],
      });

      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error);
        return res.status(400).json({
          error: "Invalid ingredient data",
          details: {
            message: "Validation failed",
            errors: validationResult.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }

      const validatedData = validationResult.data;
      console.log('Validated ingredient data:', JSON.stringify(validatedData, null, 2));

      // Update the ingredient
      const updatedIngredient = await storage.updateIngredient(id, validatedData);
      if (!updatedIngredient) {
        return res.status(500).json({
          error: "Failed to update ingredient",
          details: { message: "Database update failed" }
        });
      }
      
      console.log('Updated ingredient:', JSON.stringify(updatedIngredient, null, 2));
      res.json(updatedIngredient);
    } catch (error) {
      console.error("Error updating ingredient:", error);
      res.status(500).json({
        error: "Failed to update ingredient",
        details: {
          message: error instanceof Error ? error.message : "Unknown error occurred"
        }
      });
    }
  });

  app.delete("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIngredient(id);
      if (!success) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ingredient" });
    }
  });

  // Excel Import/Export routes for Products
  app.post("/api/products/import", uploadExcel.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const importedProducts = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as any;
          
          // Map Excel columns to product fields - specific fields only
          const productData = {
            name: row.name || row.Name || row.NAME,
            netVolume: row.netVolume || row['Net Volume'] || row.NET_VOLUME || row.netvolume,
            vintage: row.vintage || row.Vintage || row.VINTAGE,
            wineType: row.wineType || row['Wine Type'] || row.Type || row.type || row.WINE_TYPE || row.winetype,
            sugarContent: row.sugarContent || row['Sugar Content'] || row.SUGAR_CONTENT || row.sugarcontent,
            appellation: row.appellation || row.Appellation || row.APPELLATION,
            sku: row.sku || row.SKU
          };

          // Validate required fields
          if (!productData.name) {
            errors.push(`Row ${i + 2}: Name is required`);
            continue;
          }

          const result = insertProductSchema.safeParse(productData);
          if (!result.success) {
            errors.push(`Row ${i + 2}: ${result.error.errors.map(e => e.message).join(', ')}`);
            continue;
          }

          const product = await storage.createProduct(result.data);
          importedProducts.push(product);
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        success: true,
        imported: importedProducts.length,
        errors: errors,
        products: importedProducts
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import products" });
    }
  });

  // Excel Import/Export routes for Ingredients
  app.post("/api/ingredients/import", uploadExcel.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const importedIngredients = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as any;
          
          // Map Excel columns to ingredient fields
          const ingredientData = {
            name: row.name || row.Name || row.NAME,
            category: row.category || row.Category || row.CATEGORY,
            e_number: row.e_number || row['E Number'] || row.E_NUMBER || row.enumber || row.eNumber,
            allergens: typeof (row.allergens || row.Allergens || row.ALLERGENS) === 'string' 
              ? (row.allergens || row.Allergens || row.ALLERGENS).split(',').map((a: string) => a.trim())
              : (row.allergens || row.Allergens || row.ALLERGENS || []),
            details: row.details || row.Details || row.DETAILS || null
          };

          // Validate required fields
          if (!ingredientData.name) {
            errors.push(`Row ${i + 2}: Name is required`);
            continue;
          }

          const result = insertIngredientSchema.safeParse(ingredientData);
          if (!result.success) {
            errors.push(`Row ${i + 2}: ${result.error.errors.map(e => e.message).join(', ')}`);
            continue;
          }

          const ingredient = await storage.createIngredient(result.data);
          importedIngredients.push(ingredient);
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        success: true,
        imported: importedIngredients.length,
        errors: errors,
        ingredients: importedIngredients
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import ingredients" });
    }
  });

  // Add test data route
  app.post("/api/test/create-sample", async (req, res) => {
    try {
      console.log('Creating sample product...');
      const sampleProduct = {
        name: "Sample Wine",
        brand: "Test Brand",
        net_volume: "750ml",
        vintage: "2023",
        wine_type: "Red",
        sugar_content: "Dry",
        appellation: "Test Region",
        alcohol_content: "14%",
        sku: "TEST-001",
        ean: "1234567890"
      };

      const product = await storage.createProduct(sampleProduct);
      console.log('Sample product created:', product);
      res.json(product);
    } catch (error) {
      console.error('Error creating sample product:', error);
      res.status(500).json({ 
        error: "Failed to create sample product",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
