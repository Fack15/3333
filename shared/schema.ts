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
  net_volume: text("net_volume"),
  vintage: text("vintage"),
  wine_type: text("wine_type"),
  sugar_content: text("sugar_content"),
  appellation: text("appellation"),
  alcohol_content: text("alcohol_content"),
  packaging_gases: text("packaging_gases"),
  portion_size: text("portion_size"),
  kcal: text("kcal"),
  kj: text("kj"),
  fat: text("fat"),
  carbohydrates: text("carbohydrates"),
  organic: boolean("organic").default(false),
  vegetarian: boolean("vegetarian").default(false),
  vegan: boolean("vegan").default(false),
  operator_type: text("operator_type"),
  operator_name: text("operator_name"),
  operator_address: text("operator_address"),
  operator_info: text("operator_info"),
  country_of_origin: text("country_of_origin"),
  sku: text("sku"),
  ean: text("ean"),
  external_link: text("external_link"),
  redirect_link: text("redirect_link"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: integer("created_by"),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  e_number: text("e_number"),
  allergens: text("allergens").array(),
  details: text("details"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: integer("created_by"),
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

// Helper functions
export const stringOrNull = z.string().trim().transform(str => str || null).nullable();
const booleanWithDefault = (defaultValue: boolean) => z.boolean().default(defaultValue);
const integerOrNull = z.union([
  z.number().int(),
  z.string().trim().transform(str => str ? parseInt(str) : null)
]).nullable();

// Helper to convert number or string to string for database
const numberToStringOrNull = (value: number | string | null | undefined): string | null => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  return value.toString();
};

// Accept either number or string input for nutrition fields
const nutritionField = z.union([
  z.number(),
  z.string().trim()
]).transform(numberToStringOrNull).nullable();

export const insertProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
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
  organic: z.boolean().optional().default(false),
  vegetarian: z.boolean().optional().default(false),
  vegan: z.boolean().optional().default(false),
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

export const insertIngredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: stringOrNull.optional(),
  e_number: z.string().trim().transform(str => str || null).nullable().optional(),
  allergens: z.array(z.string()).optional().default([]),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
