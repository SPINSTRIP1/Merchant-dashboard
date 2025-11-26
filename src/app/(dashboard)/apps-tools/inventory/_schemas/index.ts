import { z } from "zod";

// Enum schemas
export const productTypeSchema = z.enum(["DEFINITE", "INDEFINITE"]);
export const productStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
]);
export const cycleTypeSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
export const dayOfWeekSchema = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

// Product Variant Schema
export const productVariantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  dimensions: z.string().optional(),
  shape: z.string().optional(),
  form: z.string().optional(),
});

// Slot Configuration Schema
export const slotConfigSchema = z.object({
  slotCapacityPerCycle: z
    .number()
    .int()
    .positive("Slot capacity must be positive"),
  cycleType: cycleTypeSchema,
  cycleStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  excludedDays: z.array(dayOfWeekSchema).optional(),
  excludedDates: z
    .array(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    )
    .optional(),
});

// Complete Inventory Product Schema - Single unified schema
export const inventoryProductSchema = z
  .object({
    catalogId: z.string().optional(), // Optional for creation, required for updates
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Category is required"),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    brand: z.string().optional(),
    productType: productTypeSchema,
    sellingPrice: z.number().positive("Selling price must be positive"),
    costPrice: z.number().positive("Cost price must be positive"),
    taxPercentage: z
      .number()
      .min(0, "Tax percentage cannot be negative")
      .max(100, "Tax percentage cannot exceed 100"),
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
    maxStockLevel: z
      .number()
      .int()
      .positive("Max stock level must be positive"),
    minStockLevelPercentage: z
      .number()
      .min(0, "Minimum stock percentage cannot be negative")
      .max(100, "Minimum stock percentage cannot exceed 100"),
    status: productStatusSchema,
    showInMenu: z.boolean(),
    isFeatured: z.boolean(),
    variant: productVariantSchema.optional(),
    slotConfig: slotConfigSchema.optional(),
    dealIds: z.array(z.string()).optional(),
    files: z.array(z.instanceof(File)).optional(),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price should be greater than or equal to cost price",
    path: ["sellingPrice"],
  })
  .refine((data) => data.quantity <= data.maxStockLevel, {
    message: "Current quantity cannot exceed max stock level",
    path: ["quantity"],
  });

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
// Type inference
export type InventoryProduct = z.infer<typeof inventoryProductSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  category: CatalogCategory;
  catalog: Catalog;
  inventory: {
    maxStockLevel: number;
    minStockLevel: number;
    stockLevel: string;
    stockStatus: StockStatus;
    quantity: number;
  };
};

// Stats response schema
export const inventoryStatsResponseSchema = z.object({
  inStock: z.number(),
  lowStock: z.number(),
  outOfStock: z.number(),
  recentlyUpdated: z.number(),
  totalItems: z.number(),
});

export type InventoryStatsResponse = z.infer<
  typeof inventoryStatsResponseSchema
>;

// Catalog Category Schema
export const catalogCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

// Catalog Schema
export const catalogSchema = z.object({
  name: z.string().min(2, "Catalog name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry: z.string().optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  categories: z
    .array(catalogCategorySchema)
    .min(1, "At least one category is required"),
});

export type CatalogCategory = z.infer<typeof catalogCategorySchema>;
export type Catalog = z.infer<typeof catalogSchema>;
