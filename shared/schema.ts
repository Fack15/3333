import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isEmailConfirmed: boolean("is_email_confirmed").default(false).notNull(),
  emailConfirmationToken: varchar("email_confirmation_token", { length: 255 }),
  emailConfirmationTokenExpiry: timestamp("email_confirmation_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  netVolume: text("net_volume"),
  vintage: text("vintage"),
  wineType: text("wine_type"),
  sugarContent: text("sugar_content"),
  appellation: text("appellation"),
  alcoholContent: text("alcohol_content"),
  packagingGases: text("packaging_gases"),
  portionSize: text("portion_size"),
  kcal: text("kcal"),
  kj: text("kj"),
  fat: text("fat"),
  carbohydrates: text("carbohydrates"),
  organic: boolean("organic").default(false),
  vegetarian: boolean("vegetarian").default(false),
  vegan: boolean("vegan").default(false),
  operatorType: text("operator_type"),
  operatorName: text("operator_name"),
  operatorAddress: text("operator_address"),
  operatorInfo: text("operator_info"),
  countryOfOrigin: text("country_of_origin"),
  sku: text("sku"),
  ean: text("ean"),
  externalLink: text("external_link"),
  redirectLink: text("redirect_link"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by"),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  eNumber: text("e_number"),
  allergens: text("allergens").array(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
