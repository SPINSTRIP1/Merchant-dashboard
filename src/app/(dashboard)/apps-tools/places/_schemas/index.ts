import z from "zod";

// Availability schema for each day
export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  isOpen: z.boolean(),
  openTime: z.string(), // Format: "HH:MM"
  closeTime: z.string(), // Format: "HH:MM"
});

export type Availability = z.infer<typeof availabilitySchema>;

// Place schema
export const placeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Place name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  landmarks: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  longitude: z.number(),
  latitude: z.number(),
  placeType: z.enum([
    "BEACH_RESORT",
    "HOTEL",
    "RESTAURANT",
    "PARK",
    "MUSEUM",
    "THEATER",
    "STADIUM",
    "OTHER",
  ]),
  accessModel: z.enum(["GATE_FEE", "FREE", "RESERVATION", "MEMBERSHIP"]),
  emails: z.array(z.string().email("Invalid email format")),
  phoneNumbers: z.array(z.string().min(10, "Invalid phone number")),
  environmentalSafetyPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),
  disclaimers: z.string().optional(),
  status: z.enum(["PUBLISHED", "UNPUBLISHED", "DRAFT"]),
  availability: z.array(availabilitySchema),
  website: z.string().url("Invalid URL").optional(),
});

export type Place = z.infer<typeof placeSchema>;
