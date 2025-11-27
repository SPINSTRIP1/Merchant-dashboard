import z from "zod";

export const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  id: z.string(),
});
export type Campaign = z.infer<typeof campaignSchema>;

export const dealSchema = z.object({
  campaignId: z.string().optional(),
  name: z.string().min(2, "Deal name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  discountPercentage: z
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  maximumThreshold: z
    .number()
    .min(0, "Maximum threshold must be a positive number")
    .optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  productIds: z.array(z.string()),
  // .min(1, "At least one product must be selected"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"]),
  isFeatured: z.boolean(),
  id: z.string().optional(),
});

export type Deal = z.infer<typeof dealSchema>;
