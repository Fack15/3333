import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProductSchema,
  insertIngredientSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";
import { AuthService } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

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
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
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
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data", details: error });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data", details: error });
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
  app.post("/api/products/:id/image", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update product with new image URL
      const updatedProduct = await storage.updateProduct(id, { imageUrl });
      
      if (!updatedProduct) {
        return res.status(500).json({ error: "Failed to update product" });
      }

      res.json({ imageUrl, message: "Image uploaded successfully" });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

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
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      res
        .status(400)
        .json({ error: "Invalid ingredient data", details: error });
    }
  });

  app.put("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIngredientSchema.partial().parse(req.body);
      const ingredient = await storage.updateIngredient(id, validatedData);
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res
        .status(400)
        .json({ error: "Invalid ingredient data", details: error });
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
            eNumber: row.eNumber || row['E Number'] || row.E_NUMBER || row.enumber,
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

  const httpServer = createServer(app);

  return httpServer;
}
