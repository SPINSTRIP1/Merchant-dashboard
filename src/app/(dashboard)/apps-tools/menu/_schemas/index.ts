import z from "zod";

const availabilityScheduleSchema = z.object({
  days: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
});

const nutritionAllergenSchema = z.object({
  name: z.string(),
  type: z.enum(["allergen", "nutrition"]),
});

const addOnSchema = z.object({
  name: z.string(),
  price: z.number(),
});

const extraSchema = z.object({
  name: z.string(),
  price: z.number(),
});
const menuStatusSchema = z.enum([
  "DRAFT",
  "AVAILABLE",
  "PENDING",
  "UNAVAILABLE",
]);
export const menuSchema = z.object({
  name: z.string().min(2, "Menu name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().min(0, "Quantity must be a positive number"),
  category: z.string().min(1, "Category is required"),
  status: menuStatusSchema,
  tag: z.string().optional(),
  isFeatured: z.boolean(),
  availabilityType: z.enum(["ALWAYS_AVAILABLE", "SCHEDULED", "UNAVAILABLE"]),
  availabilitySchedule: availabilityScheduleSchema.optional(),
  nutritionAllergens: z.array(nutritionAllergenSchema).optional(),
  addOns: z.array(addOnSchema).optional(),
  sizeOptions: z.array(z.string()).optional(),
  extras: z.array(extraSchema).optional(),
  dealId: z.string().optional(),
  id: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
  images: z.array(z.string()).optional(),
  code: z.string().optional(),
  isHidden: z.boolean().optional(),
  rating: z.number().optional(),
});
export type MenuStatus = z.infer<typeof menuStatusSchema>;
export type Menu = z.infer<typeof menuSchema>;
