import z from "zod";

// Ticket tier schema for events
export const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Tier name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  quantityAvailable: z.number().min(1, "Quantity must be at least 1"),
  sortOrder: z.number().optional(),
});

export type TicketTier = z.infer<typeof ticketTierSchema>;

// Per-tier, per-status sales aggregate returned by GET /events/{id}
export const ticketSalesBreakdownSchema = z.object({
  ticketTierId: z.string(),
  ticketTierName: z.string(),
  status: z.string(),
  count: z.number(),
  totalAmount: z.string(),
});

export type TicketSalesBreakdown = z.infer<typeof ticketSalesBreakdownSchema>;

// Event schema
export const eventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Event name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  frequency: z.enum(["ONE_OFF", "RECURRING"]),
  recurringPattern: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"])
    .optional(),
  customRecurrenceDays: z.number().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  location: z.string().min(5, "Location is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  contactPhone: z.string().min(10, "Invalid phone number"),
  contactEmail: z.string().email("Invalid email format"),
  expectedGuests: z.number().min(1, "Expected guests must be at least 1"),
  soldOutThreshold: z.number().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
  dealId: z.string().optional(),
  formId: z.string().optional(),
  placeId: z.string().optional(),
  ticketTiers: z.array(ticketTierSchema).optional(),
  files: z
    .array(z.instanceof(File))
    .min(1, "At least one image file is required"),
  images: z.array(z.string()).optional(),
  totalImpressions: z.number().optional(),
  totalTransactions: z.number().optional(),
  ticketSalesBreakdown: z.array(ticketSalesBreakdownSchema).optional(),
  dropOffRate: z.number().optional(),
  tagline: z.string().optional(),
  // coverImageUrl: z.string().optional(),
});

export type Event = z.infer<typeof eventSchema>;
